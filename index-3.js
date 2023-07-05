const express = require('express');
const jwt=require('jsonwebtoken'); 
const fs=require('fs');
const app = express();
const secret="i_love_anime";
const superSecret="i_hate_girls";

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];
let purchasedCourses=[];
let user_purchases={};

try {
  ADMINS = JSON.parse(fs.readFileSync('admins.json', 'utf8'));
  USERS = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  COURSES = JSON.parse(fs.readFileSync('courses.json', 'utf8'));
  purchasedCourses=JSON.parse(fs.readFileSync('purchases.json','utf8'));
} catch {
  ADMINS = [];
  USERS = [];
  COURSES = [];
}

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
  let found=false;
  for(let i=0;i<ADMINS.length;i++)
  {
    let admin=ADMINS[i];
    // console.log(admin);
    if(username == admin.username)
    {
      found=true;
      break;
    }
  }
  if(found)
  {
    res.status(404).send("Admin already exists");
  }
  else
  {
    let admin={
      username:username,
      password:password
    };
    let token=jwt.sign(admin,secret, { expiresIn: '1h' });
    ADMINS.push(admin);
    let data=JSON.stringify(ADMINS);
    fs.writeFile('admins.json',data,(err)=>{
      if(err)
        throw err;
      else
        console.log("Data written successfully");
    })
    let obj={
      message:"Admin successfully created",
      token:token
    }
    res.send(obj);
  }
});

app.post('/admin/login',(req, res) => {
  // logic to log in admin
  let username=req.headers.username;
  let password=req.headers.password;
  let found=false;
  let admin;
  for(let i=0;i<ADMINS.length;i++)
  {
    // console.log(admin);
    if(username == ADMINS[i].username)
    {
      admin=ADMINS[i];
      found=true;
      break;
    }
  }
  if(found)
  {
    if(admin.password == password)
    {
      let token=jwt.sign(admin,secret, { expiresIn: '1h' });
      res.send({message :"Login is Successfull" , token:token});
    }
    else
    {
      res.status(404).send("Invalid Credential's");
    }
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
  let data=JSON.stringify(COURSES);
  fs.writeFile('courses.json',data,(err)=>{
    if(err)
      throw err;
    else
      console.log("Data written successfully");
  })
  res.send({message: "Course Created Successfully",courseId: courseId+1});
});

app.put('/admin/courses/:courseId',authenticateAdmin, (req, res) => {
  // logic to edit a course
  let courseId=req.params.courseId;
  let found=false;
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
      found=true;
      let data=JSON.stringify(COURSES);
      fs.writeFile('courses.json',data,(err)=>{
        if(err)
          throw err;
        else
          console.log("Data written successfully");
      })
      break;
    }
  }
  if(!found)
  {
    res.status(404).send("No such Course Exists");
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
  let found=false;
  for(let i=0;i<USERS.length;i++)
  {
    let user=USERS[i];
    if(username == user.username)
    {
      found=true;
      break;
    }
  }
  if(found)
  {
    res.status(404).send("User already exists");
  }
  else
  {
    let user={
      username:username,
      password:password
    }
    let token=jwt.sign(user,superSecret,{ expiresIn: '1h' });
    USERS.push(user);
    let data=JSON.stringify(USERS);
      fs.writeFile('users.json',data,(err)=>{
        if(err)
          throw err;
        else
          console.log("Data written successfully");
      })
    let obj={
      message:"User successfully created",
      token:token
    }
    res.send(obj);
  }
});

app.post('/users/login',(req, res) => {
  // logic to log in user
  let username=req.headers.username;
  let password=req.headers.password;
  for(let i=0;i<USERS.length;i++)
  {
    let user=USERS[i];
    if(username == user.username && password==user.password)
    {
      let token=jwt.sign(user,superSecret, { expiresIn: '1h' });
      res.send({ message: 'Logged in successfully', token: token });
    }
    else
    {
      res.status(404).send("Invalid login Credentials");
    }
  }
});

app.get('/users/courses',authenticateUser,(req, res) => {
  // logic to list all courses
  res.send(JSON.stringify(COURSES));
});

app.post('/users/courses/:courseId',authenticateUser, (req, res) => {
  // logic to purchase a course
  let courseId=req.params.courseId;
  let found=false;
  for(let i=0;i<COURSES.length;i++)
  {
    if(COURSES[i].courseId == courseId)
    {
      let course=COURSES[i];
      // user_purchases[course]=req.user.username;
      let purchase={
        course:course,
        user:req.user.username
      }
      purchasedCourses.push(purchase);
      let data=JSON.stringify(purchasedCourses);
      fs.writeFile('purchases.json',data,(err)=>{
        if(err)
          throw err;
        else
          console.log("Data written successfully");
      })
      res.send("Course purchased successfully");
      found=true;
      break;
    }
  }
  if(!found)
  {
    res.status(404).send("No such course exists");
  }
});

app.get('/users/purchasedCourses',authenticateUser, (req, res) => {
  // logic to view purchased courses
  let ans=[];
  for(let i=0;i<purchasedCourses.length;i++)
  {
    let username=req.user.username;
    if(username == purchasedCourses[i].user)
    {
      ans.push(purchasedCourses[i]);
    }
  }
  res.send(JSON.stringify(ans));
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
