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
Second line[feature1]
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "feature commit 1"

@"
First-line
Second line[feature2]
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "feature commit 2"

    git checkout main

@"
First-line
Second line[main bugfix1]
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "bugfix commit 1"

@"
First-line
Second line[main bugfix2]
Third line
"@ > file.txt

    git add *
    git -c commit.gpgsign=false commit -m "bugfix commit 2"

    git checkout feature

    git rebase main

} finally {
    Pop-Location
}
