require('dotenv').config()

const { Telegraf, Telegram } = require('telegraf');

const { whatIsOppySaying } = require('./helpers/openai');
const { storeIDs, reloadIDs } = require('./helpers/file');
const { doesThisSmellFishyToYou } = require('./helpers/contract');
const { getProofStringFromQrCode } = require('./helpers/qrcode');


const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);
const telegram = new Telegram(process.env.TELEGRAM_BOT_KEY)


let verifiedIDs = reloadIDs();

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('/verify to start'));


bot.command("verify", async (ctx) => {

    verifiedIDs = reloadIDs();

    if (ctx.message.text.split(" ").length == 0) {
        ctx.reply("No Proof Provided");
        return;
    }

    const proofString = ctx.message.text.split(" ")[1];

    verifyAndDoThisForMe(proofString, ctx)
})

bot.command("reset", async (ctx) => {
    const id = ctx.chat.id
    verifiedIDs = reloadIDs();
    if (!verifiedIDs[id]) {
        ctx.reply("Verify First");
        return;
    }
    storeIDs({});
    verifiedIDs = reloadIDs();
    ctx.reply("Done")
});

bot.command("ask", async (ctx) => {

    const id = ctx.chat.id

    verifiedIDs = reloadIDs();

    if (!verifiedIDs[id]) {
        ctx.reply("Verify First");
        return;
    }

    const question = ctx.message.text.replace("/ask", '');

    const response = await whatIsOppySaying(question);

    const choices = response.data.choices;

    if (choices.length > 0)
        ctx.reply(choices[0].text);
    else ctx.reply("No reply for you");

})

bot.on('document', async (ctx) => {

    console.log(ctx.message.photo)
    const photos = ctx.message.photo;
    if (photos.length == 0) {
        ctx.reply("Empty Photo")
        return;
    }
    const fileLink = await telegram.getFileLink(photo.file_id)
    console.log(fileLink.href)
    const proofString = getProofStringFromQrCode(fileLink.href);


})


async function verifyAndDoThisForMe(proofString, ctx) {
    const proof = JSON.parse(proofString);


    ctx.reply("Verifying prooof....")

    try {
        ctx.reply("Awaiting for Tx.....")
        await doesThisSmellFishyToYou(proof);

    } catch (e) {
        console.log(e)
        ctx.reply("Verification Failed");
        return;
    }


    verifiedIDs[ctx.chat.id] = true;

    storeIDs(verifiedIDs);

    ctx.reply("Verified");

}


bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));