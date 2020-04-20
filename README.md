# uTutor BackEnd
# SOFTWARE2020_KND_BackEnd

Backend project developed by students from PUCP for the Software Engineering course in javascript with Express.js for tutoring management at the university.

## Quick Start

To start developing ...

```shell
# Clone the project
git clone ...

# Install dev dependencies
npm install

# Copy .env from .env.example and set its properties (for start, set only the DB credentials and a random session secret)
cp .env.example .env

# Bring up the server up 
npm run server

```

---

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```

## Run It

#### Run in _development_ mode:

Runs the application is development mode. Should not be used in production (with nodemon to restart if chages were found)

```shell
npm run server
```

or debug it

```shell
npm run dev:debug
```

#### Run in _production_ mode:

##### Requirements

... if Flores and skateholders agree to use our product

##### Compile it and start it

Before running into production, change the `.env` file, by setting `IS_PROD` to `true`.
Compiles the application and starts it in production production mode.

```shell
npm run compile
pm2 start build/index.js
```

## Try It

-   Open you're browser to [http://localhost:5000](http://localhost:5000)
-   You should see a link to our online documentation through Swagger (still)


## Important!

Make sure to submit descriptive commit message! We know that it can be tedious, so we made a commit
message template (`.gitcommit`) to help you with that. You can use it by:

```bash
git config commit.template ./.gitcommit # Tell Git to read the template file
# (Make some changes)
git add .
git commit -v # Open your editor with the template loaded
```

Notice that we didn't use `git commit -m`. That command by-passes the commit long description and the commit message template.
**Please avoid that command**. Try to be as communicative in
each commit as possible, explaining the "what" and "why"s behind each commit.

Also, if your changes are getting longer and longer, involving multiple modules, **avoid** committing them in
a single commit. Instead, try to use `git add -p` and split your changes into multiple commits.
That makes it so much more easy to understand the changes.