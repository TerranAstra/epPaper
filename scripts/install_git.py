import subprocess
import os
def is_git_installed():
    try:
        result = subprocess.run(['git', '--version'], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(" * git check: PASS.")
        print("  - - Result:" + str(result))
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(" * git check: FAIL.")
        print("  - - Subprocess.calledProcessError:" + str(subprocess.CalledProcessError.to_string()))
        print("  - - FileNotFoundError:" + str(FileNotFoundError.to_string()))
        print("  - - git is NOT installed on this system.\nYou can install git on a Raspberry Pi using:")
        print(" sudo apt-get install git")
        return False
if __name__ == "__main__":
    if is_git_installed():
        print(" * git check: PASS.")
    else:
        print(" * git check: FAIL.")
