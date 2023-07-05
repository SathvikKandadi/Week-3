const express = require('express');
const bodyParser=require('body-parser');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let check={};
let check_user={};
let user_purchases={};
let purchasedCourses =[];
app.use(bodyParser.json());
// Admin routes
app.post('/admin/signup', (req, res) => { // get post put delete CRUD operations
  // logic to sign up admin
  let username=req.body.username;
  let password=req.body.password;
  let user={
    username:username,
    password:password
  }
  if(username in check) // {sathvik 12345678} => sathvik 
  {
    res.status(404).send("Username already exists");
  }
  else
  {
    check[username]=user;
    ADMINS.push(user);
    console.clear();
    console.log(ADMINS);
    res.send("Admin created successfully");
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check)
  {
    let user=check[username];
    if(user.password == password)
    {
      res.send("Login Successfull");
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such admin exists");
  }
});

app.post('/admin/courses', (req, res) => {
  // logic to create a course
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check)
  {
    let user=check[username];
    if(user.password == password)
    {
      let title=req.body.title;
      let description=req.body.description;
      let price=req.body.price;
      let imageLink=req.body.imageLink;
      let published=req.body.published;
      let courseId=Math.floor(Math.random() * 100 + 1);
      let course={
        title:title,
        description:description,
        price:price,
        imageLink:imageLink,
        published:published,
        courseId:courseId
      }
      COURSES.push(course);
      res.send("Course created successfully");
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such admin exists");
  }
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check)
  {
    let user=check[username];
    if(user.password == password)
    {
      let courseId=req.params.courseId;
      for(let i=0;i<COURSES.length;i++)
      {
        if(COURSES[i].courseId == courseId)
        {
          let course=COURSES[i];
          course.title=req.body.title;
          course.description=req.body.description;
          course.price=req.body.price;
          course.imageLink=req.body.imageLink;
          course.published=req.body.published;
          res.send("Course updated successfully");
          break;
        }
      }
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such admin exists");
  }
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check)
  {
    let user=check[username];
    if(user.password == password)
    {
      res.send(JSON.stringify(COURSES));
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such admin exists");
  }

});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  let username=req.body.username;
  let password=req.body.password;
  let user={
    username:username,
    password:password
  }
  if(username in check_user)
  {
    res.status(404).send("Username already exists");
  }
  else
  {
    check_user[username]=user;
    USERS.push(user);
    console.clear();
    console.log(USERS);
    res.send("User created successfully");
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check_user)
  {
    let user=check_user[username];
    if(user.password == password)
    {
      res.send("Login Successfull");
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such user exists");
  }

});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check_user)
  {
    let user=check_user[username];
    if(user.password == password)
    {
      res.send(JSON.stringify(COURSES));
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such user exists");
  }
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check_user)
  {
    let user=check_user[username];
    if(user.password == password)
    {
      let courseId=req.params.courseId;
      for(let i=0;i<COURSES.length;i++)
      {
        if(COURSES[i].courseId == courseId)
        {
          let course=COURSES[i];
          user_purchases[course]=username;
          purchasedCourses.push(course);
          res.send("Course purchased successfully");
          break;
        }
      }
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such user exists");
  }

});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check_user)
  {
    let user=check_user[username];
    if(user.password == password)
    {
      let ans=[];
      for(let i=0;i<purchasedCourses.length;i++)
      {
        if(user_purchases[purchasedCourses[i]] == username)
        {
          ans.push(purchasedCourses[i]);
        }
      }
      res.send(JSON.stringify(ans));
    }
    else
    {
      res.status(404).send("Invalid Login Credential's");
    }
  }
  else
  {
    res.status(404).send("No such user exists");
  }

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
