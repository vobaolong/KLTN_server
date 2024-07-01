const Report = require("../models/report");
const Notification = require("../models/notification");
const {
  sendReportShopEmail,
  sendReportProductEmail,
} = require("../controllers/email");
const Store = require("../models/store");
const Product = require("../models/product");

exports.getReport = async (req, res) => {
  try {
    const reports = await Report.find();

    res.status(200).json({ reports: reports });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await Report.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Delete successfully" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

exports.report = async (req, res) => {
  try {
    const { objectId, isStore, reason, reportBy } = req.body;
    const report = new Report({
      objectId,
      isStore,
      reason,
      reportBy,
    });

    await report.save();

    // Gửi thông báo cho admin
    const adminId = process.env.ADMIN_ID;
    const adminNotification = new Notification({
      message: `Có báo cáo mới: ${reason}`,
      userId: adminId,
      isRead: false,
      orderId: "",
    });

    await adminNotification.save();

    // if (isStore) {
    //   const store = await Store.findById(objectId);

    //   if (store) {
    //     await sendReportShopEmail(
    //       {
    //         params: {
    //           userId: store.ownerId,
    //         },
    //       },
    //       res
    //     );
    //   }
    // } else {
    //   const product = await Product.findById(objectId);

    //   if (product) {
    //     const store = await Store.findById(product.storeId);

    //     if (store) {
    //       await sendReportProductEmail(
    //         {
    //           params: {
    //             userId: store.ownerId,
    //           },
    //         },
    //         res
    //       );
    //     }
    //   }
    // }

    res.status(201).json({ message: "Báo cáo đã được gửi" });
  } catch (error) {
    console.error("Error in reportShop:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};
