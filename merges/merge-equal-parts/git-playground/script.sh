rm -rf ./repo
mkdir ./repo
cd ./repo
git init

# git config merge.conflictStyle diff3

cp ../base.ts content.ts
git add *; git commit -m first

git branch base

git checkout -b input2
cp ../input2.ts content.ts
git add *; git commit -m input2

git checkout base
cp ../input1.ts content.ts
git add *; git commit -m input1

git merge input2
