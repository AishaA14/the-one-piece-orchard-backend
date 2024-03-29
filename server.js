
// Import Dependencies //
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose, { Schema } from 'mongoose'
// Create App
const app = express()



app.use(cors())
app.use(bodyParser.json())

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`listening on port: ${port}`)
})

// Connect Database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to the database')
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error)
    })

// Create Models and Schemas
const userSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    lastLogin: {
        type: Date,
        required: true
    }
})
const User = mongoose.model('user', userSchema)

const fruitSchema = new mongoose.Schema({
    name: String,
    type: String,
    character: String,
    abilities: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }
})
const Fruit = mongoose.model('fruit', fruitSchema)

const reviewSchema = new mongoose.Schema({
    fruit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fruit',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: String
})

const Review = mongoose.model('review', reviewSchema);



// Define backend routes //
app.get('/', async (req, res) => {
    try {
        res.json({
            message: 'Hello fruit'
        })
    }
    catch (error) {
        console.error(error)
        res.sendStatus(500).json({ error: 'Page not loading' })
    }
})

// Route to home page
app.get('/fruits', async (req, res) => {
    try {
        const fruits = await Fruit.find() // Fetch all fruits from the database
        res.status(200).json({ fruits })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Route to search fruits
app.get('/fruits/list', async (req, res) => {
    try {
        const fruitList = await Fruit.find({})
        res.status(200).json(fruitList)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Route to single fruit view
app.get('/fruits/:id', async (req, res) => {
    try {
        const fruitId = req.params.id
        const fruit = await Fruit.findById(fruitId)

        if (!fruit) {
            return res.status(404).json({ error: 'Fruit not found' })
        }

        res.status(200).json(fruit)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})


// Add New Devil Fruit
app.post('/fruits/add', async (req, res) => {
    try {
        console.log(req.body)
        // Check if the fruit already exists in the database
        const existingFruit = await Fruit.findOne({ name: req.body.name });

        if (existingFruit) {
            console.log('Devil Fruit is already in the collection');
            res.status(400).json({ error: 'Devil Fruit already exists' });
            return; // Exit the route handler
        }

        // Find the user by their email 
        const user = await User.findOne({ userEmail: req.body.user });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new Devil Fruit document and associate it with the user
        const newFruit = new Fruit({
            name: req.body.name,
            type: req.body.type,
            character: req.body.character,
            abilities: req.body.abilities,
            user: user._id, // Assign the user's ID
        });

        await newFruit.save();
        console.log('New Devil Fruit added:', newFruit);
        res.status(201).json(newFruit); // Return the new Devil Fruit with a 201 status (Created)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add Devil Fruit' });
    }
});



// Edit Fruit
app.put('/fruits/update/:id', async (req, res) => {
    // let loggedInUserId = ''
    // let fruitCreaterId = ''
    const fruitId = req.params.id;
    console.log('hello', req.body.loggedInUser, req.body.name)
    const userData = await User.findOne({ userEmail: req.body.loggedInUser })
    if (userData) {
       loggedInUserId = userData._id 

    }
    const fruitData = await Fruit.findOne({ name: req.body.name })
    // if (fruitData) {
    //     fruitCreaterId = fruitData.user
    // }
    // if (loggedInUserId  !== fruitCreaterId)
    //     return res.status(400).json({ error: 'User not authorised to edit fruit' })

    // compare the loggedin user with the user that created the fruit
    // if they are not the same, throw an error saying this user is not authorised to edit this fruit, else update the fruit

    try {
        const updatedFruit = await Fruit.findByIdAndUpdate(
            fruitId,
            {
                name: req.body.name,
                type: req.body.type,
                character: req.body.character,
                user: req.body.user,

                abilities: req.body.abilities,
            },
            { new: true }
        )

        if (!updatedFruit) {
            return res.status(404).json({ error: 'Fruit not found' })
        }

        res.json({ message: 'Fruit has been updated', updatedFruit })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.delete('/fruits/:id', async (req, res) => {
    try {
        const fruitId = req.params.id
        const deletedFruit = await Fruit.findByIdAndRemove(fruitId)

        if (!deletedFruit) {
            return res.status(404).json({ error: 'Fruit not found' })
        }

        res.status(200).json({ message: 'Fruit has been deleted' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})




//* Endpoints to attributes

// For Types
// app.get('/fruits/type/:type', async (req, res) => {
//     try {
//         const type = req.params.type;
//         console.log(type)
//       const fruitType = await Fruit.find({ type: type })

//       res.status(200).json(fruitType)
//     } catch (error) {
//       console.error(error)
//       res.status(500).json({ error: 'Internal server error' })
//     }
//   })
// Route to fetch Paramecia type fruits
app.get('/fruits/type/paramecia', async (req, res) => {
    try {
        const parameciaFruits = await Fruit.find({ type: 'Paramecia' })

        res.status(200).json(parameciaFruits)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})
// Route to fetch Logia types
app.get('/fruits/type/logia', async (req, res) => {
    try {
        const logiaFruits = await Fruit.find({ type: 'Logia' })

        res.status(200).json(logiaFruits)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})
// Route to fetch Zoan types
app.get('/fruits/type/zoan', async (req, res) => {
    try {
        const zoanFruits = await Fruit.find({ type: 'Zoan' })

        res.status(200).json(zoanFruits)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Route to add a review
app.post('/fruits/:fruitId/reviews/add', async (req, res) => {
    try {
        const { fruitId, rating, comment } = req.body;
        const newReview = new Review({ fruit: fruitId, rating, comment });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});



// Route to fetch reviews for a specific fruit
app.get('/fruits/:fruitId/reviews', async (req, res) => {
    try {
        const fruitId = req.params.fruitId;
        const reviews = await Review.find({ fruit: fruitId });
        res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to list all reviews
app.get('/fruits/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json({ reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User authentication
// app.post('/user/login', async (req, res) => {
//     const now = new Date()
//     console.log(req.body.email)
//     // check if user exists, then save the session
//     // if the user does not exists create the user, then save the session
//     // 
//     const newUser = new User({ userEmail: req.body.email, lastLogin: now })
//     console.log(newUser)
//     newUser.save()
//         .then((savedUser) => {
//             const userId = savedUser._id; // Obtain the MongoDB-generated user ID

//             // Set the 'user_session' cookie with the obtained user ID.
//             const userSession = {
//                 userId: userId,
//                 // Other user session data
//             };
//             // find the correct way to acess the cookies
//             // const { cookies } = useCookies()
//             // cookies.set('user_session', userSession)

//             // res.sendStatus(200)
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).json({ error: 'Failed to create a new user' })
//         })
// })

// app.post('/user/login', async (req, res) => {
   
//     const now = new Date();

//     const newUser = new User({ userEmail: req.body.email, lastLogin: now });
//     newUser.save()
//       .then((savedUser) => {
//         const userId = savedUser._id; // Obtain the MongoDB-generated user ID

//         // Set the 'user_session' cookie with the obtained user ID.
//         const userSession = {
//           userId: userId,
//           // Other user session data
//         };

//         const { cookies } = useCookies();
//         cookies.set('user_session', userSession);

//         res.sendStatus(200);
//       })
   
// .catch((error) => {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create a new user' });
//   });
// });

app.post('/user/login', async (req, res) => {
    try {
        // Check if a user with the given email already exists
        const existingUser = await User.findOne({ userEmail: req.body.email });

        if (existingUser) {
            // User with this email already exists
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Create a new user
        const now = new Date();
        const newUser = new User({ userEmail: req.body.email, lastLogin: now });

        await newUser.save();
        
        // Set the user session cookie
        const userId = newUser._id;
        const userSession = {
            userId: userId,
            // Other user session data
        };

        const { cookies } = useCookies();
        cookies.set('user_session', userSession);

        // Respond with success
        res.sendStatus(200);
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Failed to create a new user' });
    }
});
