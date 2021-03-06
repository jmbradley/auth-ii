const express = require('express');

//Can remove all session related items ahead of configing tokens

// const session = require('express-session');

// const KnexSessionStore = require('connect-session-knex')(session);

const jwt = require('jsonwebtoken');

const cors = require('cors');

const db = require('./database/dbConfig.js');

const bcrypt = require('bcryptjs');

const server = express();

const cookieTime = (req, res, next) => {
    const token = req.headers.authorization;

    if(token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err) {
                res.status(401).json({ message: "Invalid toke, Take another"})
            } else {
                req.decodedToken = decodedToken;
                next();
            }
        })
    }
    else {
        res.status(401).json({message: 'Take a toke.'})
    }

    // next();
//   if (req.session && req.session.username) {
//     next();
//     } else {
//       res.status(401).send('Not authorized');
//     }
  }


// const sessionConfig = {
//     name:'notsession', ///we want to change to anon session software
//     secret:'something%dwarf#something',
//     cookie: { 
//       secure: false,
//       maxAge: 1000 * 60 * 1
//     },
//     httpOnly: true, ///block JS
//     resave: false,
//     saveUninitialized: false,
//     store: new KnexSessionStore({
//       tablename: 'sessions',
//       sidefieldname: 'sid',
//       knex: db,
//       createtable: true,
//       clearIntervale: 1000 * 60 * 60,
//     }),
// };


const jwtSecret = 'quikbrownfox';

function generateToken(user) {
    
    const jwtPayload = { 
        ...user,
        hello: 'FSW13',
        role: 'admin'
    };

    // const jwtSecret = 'quikbrownfox';

    const jwtOptions = {
        expiresIn: '1m',
    };
    
    return jwt.sign(jwtPayload, jwtSecret, jwtOptions)
};

server.use(
  express.json(), 
  cors(),
//   session(sessionConfig),
);

server.post('/api/register', (req, res) => {
  const credentials = req.body; 

  const hash = bcrypt.hashSync(credentials.password, 14);
  credentials.password = hash;

  db('users').insert(credentials).then(ids => {
    const id = ids[0];
    // req.session.username = credentials.username;  
    res.status(201).json({ newUserId: id})
  })
   .catch(err => {
     res.status(500).json(err);
   });
});

server.post('/api/login', (req, res) => {
  const creds = req.body;

  db('users')
    .where({username: creds.username})
    .first()
    .then(user => {
        // console.log(user.password);
        if (user && bcrypt.compareSync(creds.password, user.password)) {
    //   req.session.username = user.username;
        const token = generateToken(user);
            res.status(200).json({welcome: user.username, token });
    }
        else {
            res.status(401).json({message: 'You just cannot enter. That is all.'})
    }
  })
        .catch(err => {req.status(500).json({ message: 'Something went wrong...on our end.'})
    });
});


////////Per the notes from lecture.
// protect this route, only authenticated users should see it
server.get('/api/users', cookieTime, (req, res) => {
    db('users')
      .select('id', 'username', 'password')
      .then( users => {
        res.json({ users });
      })
      .catch(err => res.send(err));
});



// server.get('/logout', (req, res) => {
//   if(req.session) {
//     req.session.destroy(err => {
//       if(err) {
//         res.send('You will stay.')
//       }
//       else {
//         res.send('See ya');
//       }
//     });
//   }
// });

//////Day 2
// server.get('/getname', (req, res) => {
//   const name = req.session.name;
//   res.send(`hello ${name}`);
// });

// server.get('/setname', (req, res) => {
//   req.session.name = 'Frodo';
//   res.send('received');
// });



server.listen(7700, () => console.log('\nrunning on port 7700\n'));
