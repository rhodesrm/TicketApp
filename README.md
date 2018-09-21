# cs411
CS411 Project

#Commands to sync your repository with the master
#Commands must be done while terminal is inside a folder that the computer knows is a repository
	(this command only needs to be done the first time) 
  git remote add upstream https://github.com/rhodesrm/cs411.git
	git fetch upstream
	git checkout master
	git merge upstream/master

#To push the changes that you made in the files in the repository on your computer into the repository on github
#use the following commands
	git add .
	git commit
	git push

#And to submit those changes from your github repository to the master just submit a pull request from the github website

[How to add a file to a repository.](https://help.github.com/articles/adding-a-file-to-a-repository-using-the-command-line/)
