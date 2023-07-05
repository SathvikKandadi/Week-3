const express = require('express');
const jwt=require('jsonwebtoken'); 
const mongoose=require('mongoose');
const app = express();
const secret="i_love_anime";
const superSecret="i_hate_girls";

app.use(express.json());

//Defining Schema 

const adminSchema = new mongoose.Schema({
  username:String,
  password:String
})

const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
})

const courseSchema=new mongoose.Schema({
  title:String,
  description:String,
  price:Number,
  imageLink:String,
  published:Boolean,
  courseId:Number
})


// Creating Mongoose Collections

const Admin=mongoose.model('Admin',adminSchema);
const User=mongoose.model('User',userSchema);
const Course=mongoose.model('Course',courseSchema);


// Connecting to MongoDB

mongoose.connect('mongodb+srv://Sathvik:a2RqNGdDirwIdqIQ@cluster0.j0hkpb7.mongodb.net/Course');


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
app.post('/admin/signup',async (req, res) => {
  // logic to sign up admin
  let username=req.body.username;
  let password=req.body.password;
  const admin=await Admin.findOne({username});
  if(admin)
  {
    res.status(403).send("Admin already exists");
  }
  else
  {
    let obj={
      username:username,
      password:password
    }
    const newAdmin = new Admin(obj);
    await newAdmin.save();
    const token=jwt.sign(obj,secret,{expiresIn: '1hr'});
    res.send({message:"Admin is successfully created" , token:token});
  }
});

app.post('/admin/login',async(req, res) => {
  // logic to log in admin
  let username=req.headers.username;
  let password=req.headers.password;
  const admin=await Admin.findOne({username});
  if(admin)
  {
    if(admin.password == password)
    {
      let obj={
        username:username,
        password:password
      }
      let token=jwt.sign(obj,secret, { expiresIn: '1h' });
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

app.post('/admin/courses',authenticateAdmin,async(req, res) => {
  // logic to create a course
  let title=req.body.title;
  let description=req.body.description;
  let price=req.body.price;
  let imageLink=req.body.imageLink;
  let published=req.body.published;
  const checkDup=await Course.findOne({title});
  if(checkDup)
  {
    res.status(403).send("Course already exists");
  }
  else
  {
    let courseId=Math.floor(Math.random()*1000 + 1);
    let course={
    title:title,
    description:description,
    price:price,
    imageLink:imageLink,
    published:published,
    courseId:courseId
    }
    const newCourse= new Course(course);
    await newCourse.save();
    res.send({message: "Course Created Successfully",courseId: courseId});
  }
  
});

app.put('/admin/courses/:courseId',authenticateAdmin, async(req, res) => {
  // logic to edit a course
  let courseId=req.params.courseId;
  const course=await Course.findOne({courseId});
  if(course)
  {
    course.title=req.body.title;
    course.description=req.body.description;
    course.price=req.body.price;
    course.imageLink=req.body.imageLink;
    course.published=req.body.published;
    const newCourse = new Course(course);
    await newCourse.save();
    res.send({ message: 'Course updated successfully' });
  }
  else
  {
    res.status(404).send("No such Course Exists");
  }
});

app.get('/admin/courses',authenticateAdmin, async(req, res) => {
  // logic to get all courses
  let COURSES=await Course.find({});
  res.send(JSON.stringify(COURSES));

});

// User routes
app.post('/users/signup', async(req, res) => {
  // logic to sign up user
  let username=req.body.username;
  let password=req.body.password;
  const user=await User.findOne({username});
  if(user)
  {
    res.status(403).send("User already exists");
  }
  else
  {
    let obj={
      username:username,
      password:password
    }
    const newUser = new User(obj);
    await newUser.save();
    const token=jwt.sign(obj,superSecret,{expiresIn: '1hr'});
    res.send({message:"User is successfully created" , token:token});
  }
});

app.post('/users/login',async(req, res) => {
  // logic to log in user
  let username=req.headers.username;
  let password=req.headers.password;
  const user=await User.findOne({username});
  if(user)
  {
    if(user.password == password)
    {
      let obj={
        username:username,
        password:password
      }
      let token=jwt.sign(obj,superSecret, { expiresIn: '1h' });
      res.send({message :"Login is Successfull" , token:token});
    }
    else
    {
      res.status(404).send("Invalid Credential's");
    }
  }
  else
  {
    res.status(404).send("No Such User exists");
  }
});

app.get('/users/courses',authenticateUser,async(req, res) => {
  // logic to list all courses
  let COURSES=await Course.find({published:true});
  res.send(JSON.stringify(COURSES));
});

app.post('/users/courses/:courseId',authenticateUser, async(req, res) => {
  // logic to purchase a course
  let courseId=req.params.courseId;
  const course=await Course.findOne({courseId});
  if(course)
  {
    const user=await User.findOne({username: req.user.username});
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({ message: 'Course purchased successfully' });
    } 
    else {
      res.status(403).json({ message: 'User not found' });
    }
  }
  else
  {
    res.status(404).send("No such course exists");
  }
});

app.get('/users/purchasedCourses',authenticateUser, async(req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses');
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: 'User not found' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
