import subprocess
import scripts.install_git as install_git
import scripts.install_docker as install_docker
import os

print("terranAstra.py beginning")

# replicate thw fucntionality of curl -fsSL https://get.docker.com | sh
# we wanto to "Smartly" (??) run the scripts in the /scripts directory

## 1) - install git
install_git.is_git_installed()

## 2) - install docker
if install_docker.is_docker_installed():
    install_docker.configure_sql_server()
else:
    print(" * docker: FAIL.")
    exit(1)

## 3) - install the other dependencies
# /scripts/install_dependencies.py

## 4) - stub in to run other scripts in the /scripts directory...
# /scripts/run_scripts.py

