rm -Force -r ./repo -ErrorAction Ignore
mkdir ./repo
cd ./repo
git init

# git config merge.conflictStyle diff3

cp ../../base.txt content.txt
git add *; git commit -m first

git branch base

git checkout -b input2
cp ../../input2.txt content.txt
git add *; git commit -m input2

git checkout base
cp ../../input1.txt content.txt
git add *; git commit -m input1

git merge input2
