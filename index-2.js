const express = require('express');
const jwt=require('jsonwebtoken'); 
const app = express();
const secret="i_love_anime";
const superSecret="i_hate_girls";

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let purchasedCourses=[];
let user_purchases={};

let check={};
const authenticateAdmin=(req,res,next)=>
{
  let authorization=req.headers.authorization;
  //console.log(authorization);
  if(authorization)
  {
    const token = authorization.split(' ')[1];
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      else
      {
        req.user = user;
        next();
      }
      
    });
  }
  else
  {
    //console.log("Error");
    res.sendStatus(404);
  }
}
const authenticateUser=(req,res,next)=>{
  let authorization=req.headers.authorization;
  if(authorization)
  {
    const token = authorization.split(' ')[1];
    jwt.verify(token, superSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      else
      {
        req.user = user;
        next();
      }
      
    });
  }
  else
  {
    res.status(404);
  }
}
// Admin routes
app.post('/admin/signup',(req, res) => {
  // logic to sign up admin
  let username=req.body.username;
  let password=req.body.password;
  if(username in check)
  {
    res.status(404).send("Admin already exists");
  }
  else
  {
    let admin={
      username:username,
      password:password
    };
    let encryptedUSer=jwt.sign(admin,secret);
    check[username]=encryptedUSer;
    //console.log(encryptedUSer);
    ADMINS.push(admin);
    let obj={
      message:"Admin successfully created",
      token:encryptedUSer
    }
    res.send(obj);
  }
});

app.post('/admin/login',(req, res) => {
  // logic to log in admin
  let username=req.headers.username;
  let password=req.headers.password;
  let admin={
    username:username,
    password:password
  };
  if(username in check)
  {
    let token=check[username];
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      else
      {
        if(user.password == password)
        {
          res.send({ message: 'Logged in successfully', token: token });
        }
        else
        {
          res.status(404).send("Invalid login Credentials");
        }
      }
      
    });
  }
  else
  {
    res.status(404).send("No Such Admin exists");
  }
});

app.post('/admin/courses',authenticateAdmin,(req, res) => {
  // logic to create a course
  let title=req.body.title;
  let description=req.body.description;
  let price=req.body.price;
  let imageLink=req.body.imageLink;
  let published=req.body.published;
  let courseId=COURSES.length;
  let course={
    title:title,
    description:description,
    price:price,
    imageLink:imageLink,
    published:published,
    courseId:courseId+1
  }
  COURSES.push(course);
  res.send({message: "Course Created Successfully",courseId: courseId+1});
});

app.put('/admin/courses/:courseId',authenticateAdmin, (req, res) => {
  // logic to edit a course
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
});

app.get('/admin/courses',authenticateAdmin, (req, res) => {
  // logic to get all courses
  res.send(JSON.stringify(COURSES));

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
  if(username in check)
  {
    res.status(404).send("User already exists");
  }
  let encryptedUSer=jwt.sign(user,superSecret);
  check[username]=encryptedUSer;
  USERS.push(user);
  let obj={
    message:"User successfully created",
    token:encryptedUSer
  }
  res.send(obj);

});

app.post('/users/login',(req, res) => {
  // logic to log in user
  let username=req.headers.username;
  let password=req.headers.password;
  if(username in check)
  {
    let token=check[username];
    jwt.verify(token, superSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      else
      {
        if(user.password == password)
        {
          res.send({ message: 'Logged in successfully', token: token });
        }
        else
        {
          res.status(404).send("Invalid login Credentials");
        }
      }
      
    });
  }
  else
  {
    res.status(404).send("No Such User exists");
  }
});

app.get('/users/courses',authenticateUser,(req, res) => {
  // logic to list all courses
  res.send(JSON.stringify(COURSES));
});

app.post('/users/courses/:courseId',authenticateUser, (req, res) => {
  // logic to purchase a course
  let courseId=req.params.courseId;
  for(let i=0;i<COURSES.length;i++)
  {
    if(COURSES[i].courseId == courseId)
    {
      let course=COURSES[i];
      user_purchases[course]=req.user.username;
      purchasedCourses.push(course);
      res.send("Course purchased successfully");
      break;
    }
  }
});

app.get('/users/purchasedCourses',authenticateUser, (req, res) => {
  // logic to view purchased courses
  let ans=[];
  for(let i=0;i<purchasedCourses.length;i++)
  {
    if(user_purchases[purchasedCourses[i]] == req.user.username)
    {
      ans.push(purchasedCourses[i]);
    }
  }
  res.send(JSON.stringify(ans));
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
