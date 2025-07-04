// const cron = require('node-cron');
// const Gallery = require('../../models/shop/Gallery');


// cron.schedule('* * * * *', async () => {
//   console.log("I am cron  ")
//   const threeDaysAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

//   try {
//     const result = await Gallery.deleteMany({
//       createdAt: { $lte: threeDaysAgo }
//     });

//     console.log(`🧹 Deleted ${result.deletedCount} old banners from Gallery`);
//   } catch (err) {
//     console.error('Error deleting old banners:', err);
//   }
// });
