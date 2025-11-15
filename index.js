const http = require("http");
const express = require("express");
const session = require("express-session");
const Authentication = require("./middlewares/Authentication");
const path = require("path");
const app = express();
const port = 3000;
const Chat = require("./models/Chat");
const { MongoClient, ObjectId } = require("mongodb");
const User = require("./models/User");
const { error } = require("console");
const Log = require("./models/Log");
const Message = require("./models/Message");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(
  session({
    secret: "cada-escolha-uma-renuncia",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

(async () => {
  try {
    const conn = await MongoClient.connect("mongodb://localhost:27017");
    const database = conn.db("messager");

    app.get("/", (req, res) => {
      if (req.session.user) {
        res.redirect("/chats");
      } else {
        res.render("home");
      }
    });

    app.get("/login", (req, res) => {
      res.render("login");
    });

    app.post("/login", async (req, res) => {
      const { name, password } = req.body;

      if (!name) {
        const errorMessage = new Error("username cannot be left empty!");
        Log.writeError("Error while trying to register: ", errorMessage);
        return res.render("login", { nameError: errorMessage.message });
      }

      if (!password) {
        const errorMessage = new Error("password cannot be left empty!");
        Log.writeError("Error while trying to register: ", errorMessage);
        return res.render("login", { passwordError: errorMessage.message });
      }

      const user = await User.readUserByNameAndPassword(
        database,
        name,
        password
      );

      if (user) {
        req.session.user = user;
        res.redirect("/chats");
      } else {
        const errorMessage = new Error("Wrong username or password");
        Log.writeError("Login Error: ", errorMessage);
        res.render("login", {
          nameError: errorMessage.message,
          passwordError: errorMessage.message,
        });
      }
    });

    app.get("/register", (req, res) => {
      res.render("register");
    });

    app.post("/register", async (req, res) => {
      const { name, password, confirmation } = req.body;

      if (!name) {
        const errorMessage = new Error("username cannot be left empty!");
        Log.writeError("Error while trying to register: ", errorMessage);
        return res.render("register", { nameError: errorMessage.message });
      }

      if (!password) {
        const errorMessage = new Error("password cannot be left empty!");
        Log.writeError("Error while trying to register: ", errorMessage);
        return res.render("register", { passwordError: errorMessage.message });
      }

      if (!confirmation) {
        const errorMessage = new Error("confirmation cannot be left empty!");
        Log.writeError("Error while trying to register: ", errorMessage);
        return res.render("register", {
          confirmationError: errorMessage.message,
        });
      }

      if (password !== confirmation) {
        const errorMessage = new Error(
          "password and confirmation doesnt match!"
        );
        Log.writeError("Error while trying to register: ", errorMessage);
        return res.render("register", {
          confirmationError: errorMessage.message,
        });
      }

      const data = await User.createUser(database, name, password);

      if (data) {
        req.session.user = data;
        res.redirect("/chats");
      } else {
        res.render("register", {
          nameError: "this user name is already in use!",
        });
      }
    });

    app.get("/chats", Authentication.validateSession, async (req, res) => {
      const currentUserId = req.session.user._id.toString();
      const foundedChats = await Chat.readChatsById(database, currentUserId);

      if (!foundedChats || foundedChats.length === 0) {
        if (!foundedChats)
          Log.writeError("Error reading chats of id " + currentUserId);
        return res.render("chats", {
          user: req.session.user,
          chatContact: [],
        });
      }

      let names = foundedChats.map(async (chat) => {
        let contactId;

        if (chat.user01Id.toString() === currentUserId) {
          contactId = chat.user02Id;
        } else {
          contactId = chat.user01Id;
        }
        const foundedUser = await User.readUserById(database, contactId);
        if (!foundedUser) {
          Log.writeError(
            "Error reading user by ID:",
            new Error(`Contact ID ${contactId} not found.`)
          );
          return false;
        }
        return foundedUser;
      });

      //  names = foundedChats.map(async (chat)=> {
      //   const foundedUser = await User.readUserById(database, chat.user02Id);
      //   if (!foundedUser)
      //     return false;
      //   return foundedUser.name;
      // });
      names = await Promise.all(names);

      let filteredNames = names.filter((name) => name !== false);
      filteredNames = filteredNames.map((user) => user.name);
      return res.render("chats", {
        user: req.session.user,
        chatContact: filteredNames,
      });
    });

    app.post("/chats", Authentication.validateSession, async (req, res) => {
      const { contactName } = req.body;
      const currentUserId = req.session.user._id.toString();

      const wasDeleted = await Chat.deleteChatByContact(
        database,
        currentUserId,
        contactName
      );

      if (!wasDeleted) {
        Log.writeError(
          "Error deleting chat:",
          new Error("deleteChatByContact returned false")
        );
      }
      res.redirect("/chats");
    });

    app.get(
      "/chats/addContact",
      Authentication.validateSession,
      async (req, res) => {
        res.render("addContact");
      }
    );

    app.post(
      "/chats/addContact",
      Authentication.validateSession,
      async (req, res) => {
        try {
          const { name } = req.body;
          if (name === req.session.user.name) {
            Log.writeError(
              "Error when user are trying to add contact:",
              new Error("user tried to add his own account")
            );
            return res.render("addContact", {
              error: "you cant add your own account!",
            });
          }

          const foundedContactUser = await User.readUserByName(database, name);
          if (!foundedContactUser) {
            Log.writeError(
              "Error when user are trying to add contact:",
              new Error("user not found")
            );
            return res.render("addContact", { error: "user not found!" });
          }
          const foundedContactUserId = foundedContactUser._id.toString();
          const contactAlreadyExist = await Chat.chatExist(
            database,
            req.session.user._id,
            foundedContactUserId
          );
          if (contactAlreadyExist) {
            Log.writeError(
              "Error when user are trying to add contact:",
              new Error("user tried to add an existing contact")
            );
            return res.render("addContact", {
              error: "contact already exist in your account!",
            });
          }

          await Chat.createChat(
            database,
            req.session.user._id,
            foundedContactUserId
          );
          res.render("addContact", {
            sucess: `${name} was sucessful added to your contacts`,
          });
        } catch (error) {
          Log.writeError(
            "Error when user are trying to add contact:",
            new Error("invalid entry!")
          );
          return res.render("addContact", { error: "cant add a new contact!" });
        }
      }
    );
    app.get(
      "/chats/:contactName",
      Authentication.validateSession,
      async (req, res) => {
        try {
          const { contactName } = req.params;
          const currentUser = req.session.user;

          const currentUserId = currentUser._id.toString();

          const contactUser = await User.readUserByName(database, contactName);
          if (!contactUser) {
            Log.writeError(
              "Error reading user by name:",
              new Error(`invalid name: ${contactName}`)
            );
            return res.redirect("/chats");
          }

          const contactUserId = contactUser._id.toString();

          const chat = await Chat.ReadChatByUsers(
            database,
            currentUserId,
            contactUserId
          );

          if (!chat) {
            return res.redirect("/chats");
          }

          const currentChatId = chat._id.toString();

          const messages =
            (await Message.readMessagesByChatId(database, currentChatId)) || [];

          if (!Array.isArray(messages)) {
            Log.writeError(
              "Error reading messages:",
              new Error("readMessagesByChatId did not return a valid array.")
            );
            return res.redirect("/chats");
          }

          const messagesWithNames = messages.map((message) => {
            const isMyMessage = message.senderId.toString() === currentUserId;

            return {
              content: message.content,
              senderName: isMyMessage ? currentUser.name : contactUser.name,
            };
          });

          return res.render("messages", {
            contactName: contactName,
            messages: messagesWithNames,
            user: currentUser,
          });
        } catch (error) {
          Log.writeError("Error loading chat/messages: ", error);
          return res.redirect("/chats");
        }
      }
    );

    app.post(
      "/chats/:contactName",
      Authentication.validateSession,
      async (req, res) => {
        console.log("fui chamado (POST /chats/:contactName)");
        const { contactName } = req.params;

        const { messageBox } = req.body;

        try {
          if (!messageBox || messageBox.trim() === "") {
            return res.redirect(`/chats/${contactName}`);
          }

          const currentUser = req.session.user;

          const currentUserId = currentUser._id.toString();

          const contactUser = await User.readUserByName(database, contactName);
          if (!contactUser) {
            Log.writeError(
              "Error reading user by name:",
              new Error(`invalid contact name: ${contactName}`)
            );
            return res.redirect("/chats");
          }

          const contactUserId = contactUser._id.toString();

          let currentChat = await Chat.ReadChatByUsers(
            database,
            currentUserId,
            contactUserId
          );

          if (!currentChat) {
            console.log(
              `Chat not found, creating new chat between ${currentUserId} and ${contactUserId}`
            );
            currentChat = await Chat.createChat(
              database,
              currentUserId,
              contactUserId
            );

            if (!currentChat) {
              Log.writeError(
                "Error creating chat:",
                new Error("Failed to create new chat")
              );
              return res.redirect("/chats");
            }
          }
          const chatId = currentChat._id.toString();

          await Message.createMessage(
            database,
            chatId,
            currentUserId,
            messageBox
          );

          res.redirect(`/chats/${contactName}`);
        } catch (error) {
          Log.writeError("Error creating messages: ", error);
          res.redirect(`/chats/${contactName}?error=sendFailed`);
        }
      }
    );

    app.get("/profile", Authentication.validateSession, async (req, res) => {
      res.render("profile", { user: req.session.user });
    });

    app.post("/profile", Authentication.validateSession, async (req, res) => {
      const { name, password } = req.body;
      if (!name) {
        Log.writeError(
          "Error updating user profile: ",
          new Error("invalid name")
        );
        return res.render("profile", {
          user: req.session.user,
          nameError: "invalid name!",
        });
      }
      if (!password) {
        Log.writeError(
          "Error updating user profile: ",
          new Error("invalid password")
        );
        return res.render("profile", {
          user: req.session.user,
          passwordError: "invalid password!",
        });
      }

      const result = await User.updateUserById(
        database,
        req.session.user._id,
        name,
        password
      );
      if (!result) {
        Log.writeError(
          "Error updating user profile: ",
          new Error("error while updating")
        );
        return res.render("profile", {
          user: req.session.user,
          error:
            "the profile have been not updated, verify if name and password are correct",
        });
      } else {
        Log.writeInformation(`Updating user ${name}`);
        req.session.user.name = name;
        req.session.user.password = password;
        return res.render("profile", {
          user: req.session.user,
          sucess: "the profile have been sucessful updated",
        });
      }
    });

    app.post(
      "/profile/remove",
      Authentication.validateSession,
      async (req, res) => {
        try {
          const user = req.session.user;
          const userId = user._id;

          await Message.deleteMessagesBySenderId(database, userId);
          await Chat.deleteChatsByUser01Id(database, userId);
          await Chat.deleteChatsByUser02Id(database, userId);
          await User.deleteUserById(database, userId);

          req.session.destroy((error) => {
            if (error) {
              Log.writeError("Error removing account:", error);
            }
            res.redirect("/");
          });
        } catch (error) {
          Log.writeError("Error removing account:", error);
          res.render("profile", {
            user: req.session.user,
            error: "Account cannot be removed. try again",
          });
        }
      }
    );

    app.get('/logout', Authentication.validateSession, (req, res) => {
    try {
        req.session.destroy((error) => {
            if (error) {
                Log.writeError("Error during logout (session destroy):", error); 
                return res.redirect('/chats'); // Volta para chats se houver erro crítico
            }
            res.redirect('/'); 
        });
    } catch(error) {
        Log.writeError("Error during logout:", error);
        res.redirect('/');
    }
});

    app.listen(port, () => {
      console.log(`Running server at port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
