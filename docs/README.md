# Team Organizer

The goal of the Team Organizer is personal to-do list with the added functionality of having you manage a team with to do lists! 

# License

Uses Apache 2.0 License

# Technologies

This is a MEAN stack application. Which means: 

- MongoDB for the database
- Express for api calls 
- Angular for templating and front-end development
- NodeJs for the server 

This doesn't need to be responsive for the mobile, but if it is that would be ideal. 

Additionally, there is a **mobile app** attached to this application written in Android studio, preferably written in **Kotlin**. 

# Features 

- A normal personal toDo List per user 
    - these have an importance, and a due date. If you have the mobile app, it will send a notification. Else, it can send an email to you when assigned or when coming up or just use our web-api
    - these also have a category 
    - you can start a task and a timer will begin on it
- ability to create groups and become Team Leader of the group
- you will be able to drag and drop and associate tasks around to members of the group 
- ability to invite them to the group (maybe via email)
- A dashboard that allows to see data about your team and your personal growth 
- charts.js allows you to track how much time you spend on tasks, how many tasks are being completed by team members and yourself over a time period and which categories you have the most of
- secure JWT login complete with salt 
- angular templating for server side html creation 

# MongoDB Data Structure

User -> has user data as well as groups he is part of, probs in a sort of array of groupName + id and a task list grouped in the same way
groups -> has a stack of users and a stack of tasks associated to users or floating (a float user)
    -> can also have just a group solely where the user is the only user inside and all tasks are associated then to this user or float 
        -> have a flag denoting ['group', 'personal']
        -> in this way you can stack multiple up multiple groupings for that user and just query database with the array 
tasks -> a task


# Additional notices

- try to read up on [Node Best Practices](https://github.com/i0natan/nodebestpractices)
- be as organized as you can! 
- comment and document as well as you can too! You can also follow my styling [here](https://dannylekim.github.io/fitnessleague/docs/codingpractices.html)



