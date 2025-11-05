using Microsoft.Data.SqlClient;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Minimal, permissive CORS for dev and local Vite apps
builder.Services.AddCors(options =>
{
  options.AddPolicy("Any", policy =>
    policy
      .AllowAnyOrigin()
      .AllowAnyHeader()
      .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Any");

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "Frank.Events.Api" }));

// POST /events: ingest ping/pong events
app.MapPost("/events", async (HttpRequest request, PingPongEventDto evt) =>
{
  var cs = Environment.GetEnvironmentVariable("SQL_CONNECTION_STRING")
           ?? builder.Configuration.GetConnectionString("EventsDb")
           ?? "Server=localhost,1433;User ID=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=False;Database=FrankEvents;";

  await EnsureTableAsync(cs);

  await using var conn = new SqlConnection(cs);
  await conn.OpenAsync();

  // Optional source metadata from headers
  var headerSourceNodeId = request.Headers["X-Source-Node-Id"].FirstOrDefault();
  var headerExportBatchId = request.Headers["X-Export-Batch-Id"].FirstOrDefault();

  var cmd = conn.CreateCommand();
  cmd.CommandText = @"
INSERT INTO [dbo].[PingPongEvents]
  (EventId, SessionId, AppId, Role, Text, IsFinal, [Timestamp], Model, Voice, GroundingJson, MetaJson, ProposedSavePath, SourceNodeId, ExportBatchId)
VALUES
  (@EventId, @SessionId, @AppId, @Role, @Text, @IsFinal, @Timestamp, @Model, @Voice, @GroundingJson, @MetaJson, @ProposedSavePath, @SourceNodeId, @ExportBatchId);";

  cmd.Parameters.AddWithValue("@EventId", evt.EventId);
  cmd.Parameters.AddWithValue("@SessionId", evt.SessionId ?? string.Empty);
  cmd.Parameters.AddWithValue("@AppId", evt.AppId ?? string.Empty);
  cmd.Parameters.AddWithValue("@Role", evt.Role ?? string.Empty);
  cmd.Parameters.AddWithValue("@Text", evt.Text ?? string.Empty);
  cmd.Parameters.AddWithValue("@IsFinal", evt.IsFinal);
  cmd.Parameters.AddWithValue("@Timestamp", evt.Timestamp);
  cmd.Parameters.AddWithValue("@Model", evt.Model ?? (object)DBNull.Value);
  cmd.Parameters.AddWithValue("@Voice", evt.Voice ?? (object)DBNull.Value);
  cmd.Parameters.AddWithValue("@GroundingJson", (object?)evt.GroundingJson ?? DBNull.Value);
  cmd.Parameters.AddWithValue("@MetaJson", (object?)evt.MetaJson ?? DBNull.Value);
  cmd.Parameters.AddWithValue("@ProposedSavePath", evt.ProposedSavePath ?? (object)DBNull.Value);
  cmd.Parameters.AddWithValue("@SourceNodeId", (object?)(evt.SourceNodeId ?? headerSourceNodeId) ?? DBNull.Value);
  if (Guid.TryParse(evt.ExportBatchId ?? headerExportBatchId, out var exportBatchGuid))
  {
    cmd.Parameters.AddWithValue("@ExportBatchId", exportBatchGuid);
  }
  else
  {
    cmd.Parameters.AddWithValue("@ExportBatchId", DBNull.Value);
  }

  await cmd.ExecuteNonQueryAsync();

  return Results.Accepted($"/events/{evt.EventId}");
});

app.Run();

// Ensures the events table exists (idempotent)
static async Task EnsureTableAsync(string connectionString)
{
  await using var conn = new SqlConnection(connectionString);
  await conn.OpenAsync();

  const string sql = @"
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'FrankEvents')
BEGIN
  CREATE DATABASE [FrankEvents];
END;
";
  await using (var cmd = new SqlCommand(sql, conn))
  {
    await cmd.ExecuteNonQueryAsync();
  }

  // Reconnect to target DB to perform table check
  var csb = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "FrankEvents" };
  await using var dbConn = new SqlConnection(csb.ConnectionString);
  await dbConn.OpenAsync();

  const string createTable = @"
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PingPongEvents]') AND type in (N'U'))
BEGIN
  CREATE TABLE [dbo].[PingPongEvents]
  (
    [EventId] UNIQUEIDENTIFIER NOT NULL,
    [SessionId] NVARCHAR(128) NOT NULL,
    [AppId] NVARCHAR(128) NOT NULL,
    [Role] NVARCHAR(32) NOT NULL,
    [Text] NVARCHAR(MAX) NOT NULL,
    [IsFinal] BIT NOT NULL,
    [Timestamp] DATETIME2 NOT NULL,
    [Model] NVARCHAR(128) NULL,
    [Voice] NVARCHAR(128) NULL,
    [GroundingJson] NVARCHAR(MAX) NULL,
    [MetaJson] NVARCHAR(MAX) NULL,
    [ProposedSavePath] NVARCHAR(512) NULL,
    [SourceNodeId] NVARCHAR(64) NULL,
    [ExportBatchId] UNIQUEIDENTIFIER NULL,
    [SourceSequence] BIGINT IDENTITY(1,1) NOT NULL,
    [IngestedAt] DATETIME2 NOT NULL CONSTRAINT DF_PingPongEvents_IngestedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_PingPongEvents] PRIMARY KEY CLUSTERED ([EventId] ASC)
  );

  CREATE INDEX IX_PingPongEvents_SourceNode_Seq ON [dbo].[PingPongEvents] (SourceNodeId, SourceSequence);
END;";

  await using (var createCmd = new SqlCommand(createTable, dbConn))
  {
    await createCmd.ExecuteNonQueryAsync();
  }

  // Add columns if table already existed (idempotent)
  var alterBatches = new[]
  {
    "IF COL_LENGTH('dbo.PingPongEvents','SourceNodeId') IS NULL ALTER TABLE dbo.PingPongEvents ADD SourceNodeId NVARCHAR(64) NULL;",
    "IF COL_LENGTH('dbo.PingPongEvents','ExportBatchId') IS NULL ALTER TABLE dbo.PingPongEvents ADD ExportBatchId UNIQUEIDENTIFIER NULL;",
    "IF COL_LENGTH('dbo.PingPongEvents','SourceSequence') IS NULL ALTER TABLE dbo.PingPongEvents ADD SourceSequence BIGINT IDENTITY(1,1) NOT NULL;",
    "IF COL_LENGTH('dbo.PingPongEvents','IngestedAt') IS NULL BEGIN ALTER TABLE dbo.PingPongEvents ADD IngestedAt DATETIME2 NOT NULL CONSTRAINT DF_PingPongEvents_IngestedAt DEFAULT (SYSUTCDATETIME()); END;",
    "IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_PingPongEvents_SourceNode_Seq' AND object_id = OBJECT_ID('dbo.PingPongEvents')) CREATE INDEX IX_PingPongEvents_SourceNode_Seq ON dbo.PingPongEvents(SourceNodeId, SourceSequence);"
  };
  foreach (var stmt in alterBatches)
  {
    await using var alter = new SqlCommand(stmt, dbConn);
    await alter.ExecuteNonQueryAsync();
  }
}

public sealed class PingPongEventDto
{
  public Guid EventId { get; set; }
  public string? SessionId { get; set; }
  public string? AppId { get; set; }
  public string? Role { get; set; }
  public string? Text { get; set; }
  public bool IsFinal { get; set; }
  public DateTime Timestamp { get; set; }
  public string? Model { get; set; }
  public string? Voice { get; set; }
  public string? GroundingJson { get; set; }
  public string? MetaJson { get; set; }
  public string? ProposedSavePath { get; set; }
  public string? SourceNodeId { get; set; }
  public string? ExportBatchId { get; set; }
}


