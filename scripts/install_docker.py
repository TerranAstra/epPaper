"""Utilities for working with Docker on developer workstations or Raspberry Pi."""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Optional


CONTAINER_NAME = "frank-mssql"
COMPOSE_FILE = Path("docker-compose.mssql.yml")
COMPOSE_PROFILE = "x64"


def _run_command(args: list[str], *, suppress_output: bool = False) -> subprocess.CompletedProcess:
    """Run a shell command with helpful logging."""

    try:
        result = subprocess.run(
            args,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except subprocess.CalledProcessError as exc:
        print(f" ! Command failed: {' '.join(args)}")
        if exc.stdout:
            print(exc.stdout.strip())
        if exc.stderr:
            print(exc.stderr.strip())
        raise

    if not suppress_output and result.stdout.strip():
        print(result.stdout.strip())
    if result.stderr.strip():
        print(result.stderr.strip())
    return result


def _container_status() -> Optional[str]:
    """Return the docker status string for the SQL container, or None if it does not exist."""

    try:
        result = subprocess.run(
            [
                "docker",
                "ps",
                "-a",
                "--filter",
                f"name=^{CONTAINER_NAME}$",
                "--format",
                "{{.Status}}",
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

    status = result.stdout.strip()
    return status or None


def configure_sql_server() -> bool:
    """Ensure the Azure SQL Edge container exists and is running."""

    print(" * SQL Server (Azure SQL Edge) configuration")
    status = _container_status()

    if status:
        print(f"  - existing container '{CONTAINER_NAME}' status: {status}")
        if status.lower().startswith("up"):
            print("  - container already running; no action needed.")
            return True

        print("  - attempting to start existing container…")
        try:
            _run_command(["docker", "start", CONTAINER_NAME], suppress_output=True)
            print("  - container started.")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("  - failed to start existing container; will try compose.")

    if not COMPOSE_FILE.exists():
        print(f"  - compose file missing: {COMPOSE_FILE}")
        return False

    print("  - running docker compose to provision container…")
    compose_args = [
        "docker",
        "compose",
        "-f",
        str(COMPOSE_FILE),
        "--profile",
        COMPOSE_PROFILE,
        "up",
        "-d",
    ]

    try:
        _run_command(compose_args, suppress_output=True)
    except FileNotFoundError:
        print("  - docker compose not found. Ensure Docker Desktop or docker-compose is installed.")
        return False
    except subprocess.CalledProcessError:
        print("  - docker compose command failed.")
        return False

    status = _container_status()
    if status and status.lower().startswith("up"):
        print(f"  - container provisioned and running (status: {status}).")
        return True

    print("  - container exists but is not running after compose; check logs manually.")
    return False


def is_docker_installed() -> bool:
    try:
        result = subprocess.run(
            ["docker", "--version"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        print(" * docker check: PASS.")
        print(f"  - {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(" * docker check: FAIL.")
        print("  - docker is NOT installed or not on PATH.")
        print("  - Install Docker Desktop (Windows/macOS) or 'sudo apt-get install docker.io' (Linux).")
        return False


if __name__ == "__main__":
    if is_docker_installed():
        configure_sql_server()

