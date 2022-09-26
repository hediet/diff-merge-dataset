rm -rf ./repo/.git
rm -rf ./repo/content.ts
mkdir ./repo
cd ./repo
git init

# git config merge.conflictStyle diff3

cp ../gitignore.txt .gitignore
cp ../base.txt content.txt
git add *; git commit -m first

git branch base

git checkout -b input2
cp ../input2.txt content.txt
git add *; git commit -m input2

git checkout base
cp ../input1.txt content.txt
git add *; git commit -m input1

git merge input2
