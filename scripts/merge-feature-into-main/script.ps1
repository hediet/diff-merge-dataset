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

    git checkout -b feature

@"
First-line
Second line[feature]
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "feature commit"

    git checkout main

@"
First-line
Second line[main bugfix]
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "bugfix commit"

    git merge feature

} finally {
    Pop-Location
}
