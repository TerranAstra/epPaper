import subprocess
import os
from pathlib import Path
from typing import Optional

# install and configure docker mcp tools, on docker, for pi     

def install_docker_mcp_tools():
    # install the docker mcp tools on docker, for pi 
    try:
        result = subprocess.run(['docker', 'compose', '-f', 'docker-compose.mssql.yml', '--profile', 'x64', 'up', '-d'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(" * docker mcp tools installation: PASS.")
        print("  - - Result:" + str(result))
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(" * docker mcp tools installation: FAIL.")
        print("  - - Subprocess.calledProcessError:" + str(subprocess.CalledProcessError.to_string()))
        print("  - - FileNotFoundError:" + str(FileNotFoundError.to_string()))
        return False

if __name__ == "__main__":
    if install_docker_mcp_tools():
        print(" * docker mcp tools installation: PASS.")
    else:
        print(" * docker mcp tools installation: FAIL.")
        exit(1)

