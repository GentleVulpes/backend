const http = require("http");
const { MongoClient } = require("mongodb");
const User = require("./models/User");
const Chat = require("./models/Chat");
const Message = require("./models/Message");
const Log = require("./models/Log");

/*OBSERVACOES
professor, devido a forma que organizei o codigo com diversos throw error, nao e possivel testar ele de maneira muito fluida como eu gostaria. peço desculpas pelo inconveniente, quando pensei no projeto pensei em interrupcoes bruscas mas esqueci-me da parte dos testes.*/

(async () => {
  let conn;

  try {
    conn = await MongoClient.connect("mongodb://localhost:27017");
    const database = conn.db("messager");

    console.log("\nIniciando reset das colecoes");
    try {
      await database.collection("users").deleteMany({});
    } catch (e) {
      console.error(e);
    }
    try {
      await database.collection("chats").deleteMany({});
    } catch (e) {
      console.error(e);
    }
    try {
      await database.collection("messages").deleteMany({});
    } catch (e) {
      console.error(e);
    }
    console.log("Colecoes limpas\n");

    console.log("Testes da classe user");
    const runInSafeMode = async (fn, ...args) => {
      try {
        await fn(...args);
      } catch (e) {
        console.error("Erro encontrado " + e.message);
      }
    };

    await runInSafeMode(User.createUser, database, "Alice", "123");
    await runInSafeMode(User.createUser, database, "Bruno", "456");
    await runInSafeMode(User.createUser, database, "Carlos", "789");
    await runInSafeMode(User.createUser, database, "Daniel", "000");

    await runInSafeMode(User.readAllUsers, database);

    const userIds = (await runInSafeMode(User.getAllUsersIds, database)) || [];
    console.log("\nids dos usuarios cadastrados: " + userIds);

    if (userIds[0])
      await runInSafeMode(User.readUserById, database, userIds[0]);
    await runInSafeMode(
      User.readUserByNameAndPassword,
      database,
      "Bruno",
      "456"
    );

    if (userIds[3])
      await runInSafeMode(User.deleteUserById, database, userIds[3]);
    if (userIds[0] && userIds[1])
      await runInSafeMode(
        User.deleteUsersByIds,
        database,
        userIds[0],
        userIds[1]
      );
    await runInSafeMode(User.readAllUsers, database);

    console.log("\nTestes da classe chat");
    await runInSafeMode(User.createUser, database, "Eva", "111");
    await runInSafeMode(User.createUser, database, "Felipe", "222");
    const refreshedUserIds =
      (await runInSafeMode(User.getAllUsersIds, database)) || [];

    await runInSafeMode(Chat.deleteAllChats, database);
    if (refreshedUserIds[0] && refreshedUserIds[1]) {
      console.log(
        "Criando chat entre " +
          refreshedUserIds[0] +
          " e " +
          refreshedUserIds[1]
      );
      await runInSafeMode(
        Chat.createChat,
        database,
        refreshedUserIds[0],
        refreshedUserIds[1]
      );
    }
    await runInSafeMode(Chat.readAllChats, database);

    const chatIds = (await runInSafeMode(Chat.getAllChatsIds, database)) || [];
    if (chatIds[0])
      await runInSafeMode(Chat.readChatById, database, chatIds[0]);
    if (refreshedUserIds[0])
      await runInSafeMode(
        Chat.readChatByUser01Id,
        database,
        refreshedUserIds[0]
      );
    if (refreshedUserIds[1])
      await runInSafeMode(
        Chat.readChatByUser02Id,
        database,
        refreshedUserIds[1]
      );

    if (chatIds[0])
      await runInSafeMode(Chat.deleteChatById, database, chatIds[0]);
    if (refreshedUserIds[0] && refreshedUserIds[1])
      await runInSafeMode(
        Chat.createChat,
        database,
        refreshedUserIds[0],
        refreshedUserIds[1]
      );
    if (refreshedUserIds[0])
      await runInSafeMode(
        Chat.deleteChatsByUser01Id,
        database,
        refreshedUserIds[0]
      );
    if (refreshedUserIds[1])
      await runInSafeMode(
        Chat.deleteChatsByUser02Id,
        database,
        refreshedUserIds[1]
      );

    if (refreshedUserIds[0] && refreshedUserIds[1])
      await runInSafeMode(
        Chat.createChat,
        database,
        refreshedUserIds[0],
        refreshedUserIds[1]
      );
    await runInSafeMode(Chat.readAllChats, database);
    const finalChatIds =
      (await runInSafeMode(Chat.getAllChatsIds, database)) || [];

    console.log("\nTestes da classe message");
    if (finalChatIds[0] && refreshedUserIds[0])
      await runInSafeMode(
        Message.createMessage,
        database,
        finalChatIds[0],
        refreshedUserIds[0],
        "Ola"
      );
    if (finalChatIds[0] && refreshedUserIds[1])
      await runInSafeMode(
        Message.createMessage,
        database,
        finalChatIds[0],
        refreshedUserIds[1],
        "Oi tudo bem"
      );
    if (finalChatIds[0] && refreshedUserIds[0])
      await runInSafeMode(
        Message.createMessage,
        database,
        finalChatIds[0],
        refreshedUserIds[0],
        "Tudo sim e voce"
      );

    if (refreshedUserIds[0])
      await runInSafeMode(
        Message.readMessagesBySenderId,
        database,
        refreshedUserIds[0]
      );
    if (refreshedUserIds[0] && refreshedUserIds[1])
      await runInSafeMode(
        Message.readMessagesBySenderAndReceiver,
        database,
        refreshedUserIds[0],
        refreshedUserIds[1]
      );

    const messages = await database.collection("messages").find().toArray();
    if (messages[0]?._id)
      await runInSafeMode(
        Message.deleteMessageById,
        database,
        messages[0]._id.toString()
      );
    if (finalChatIds[0] && refreshedUserIds[0])
      await runInSafeMode(
        Message.removeMessagesByChatIdAndSenderId,
        database,
        finalChatIds[0],
        refreshedUserIds[0]
      );

    const msgsLeft = await database.collection("messages").find().toArray();
    console.log("\nMensagens restantes no banco: " + JSON.stringify(msgsLeft));

    console.log("\nRemovendo todos os usuarios e chats restantes");
    await runInSafeMode(User.deleteAllUsers, database);
    await runInSafeMode(Chat.deleteAllChats, database);

    console.log("\nTestes finalizados");
  } catch (error) {
    Log.writeError("Erro durante os testes", error);
    console.error(error);
  } finally {
    if (conn) await conn.close();
    console.log("\nConexao com o banco encerrada");
  }
})();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Conexao encerrada");
});
server.listen(8000);
