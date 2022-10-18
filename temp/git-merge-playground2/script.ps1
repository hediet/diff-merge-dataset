rm -Force -r ./repo/.git -ErrorAction Ignore
mkdir ./repo
cd ./repo
git init

# git config merge.conflictStyle diff3

cp C:\dev\microsoft\diffing-dataset\merges\playground\base.ts content.html
git add *; git commit -m first

git branch base

git checkout -b input2
cp C:\dev\microsoft\diffing-dataset\merges\playground\input2.ts content.html
git add *; git commit -m input2

git checkout base
cp C:\dev\microsoft\diffing-dataset\merges\playground\input1.ts content.html
git add *; git commit -m input1

git merge input2

