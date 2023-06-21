try {
    if (Test-Path out) {
        Remove-Item out -Recurse -Force
    }

    mkdir out
    Push-Location -Path out
    git init

@"
First-line
Second line
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "initial commit"

@"
First-line
Second line[stash1]
Third line
"@ > file.txt

    git stash push

@"
First-line
Second line[change1]
Third line
"@ > file.txt

    git stage *
    git stash pop

} finally {
    Pop-Location
}
