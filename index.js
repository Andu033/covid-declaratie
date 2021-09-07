var nodemailer = require("nodemailer");
var pdflib = require("pdf-lib");
var AWS = require("aws-sdk");
const fetch = require("node-fetch");
const { PDFDocument, StandardFonts, rgb, degrees } = pdflib;
const ID = "dummyid";
const SECRET = "dummysecret";

// The name of the bucket that you have created
const awsF = async () => {
  const BUCKET_NAME = "test-bucket123ptcorona";

  const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET,
  });
  AWS.config.update({ region: "eu-central-1" });
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "andrei133303@gmail.com",
      pass: "bogdaneprost1",
    },
  });

  const params = {
    Bucket: BUCKET_NAME,
    CreateBucketConfiguration: {
      // Set your region here
      LocationConstraint: "eu-west-1",
    },
  };

  var mailOptions = {
    from: "andrei133303@gmail.com",
    to: "dcuan17@yahoo.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };

  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //   }
  // });
  async function createPdf() {
    const url =
      "https://test-bucket123ptcorona.s3-eu-west-1.amazonaws.com/file(1).pdf";
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    firstPage.drawText(
      new Date().toISOString().split("T")[0].split("-").reverse().join(" / "),
      {
        x: 80,
        y: 500,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      }
    );

    const pdfBytes = await pdfDoc.save();
    console.log(pdfBytes);
    const params = {
      Bucket: BUCKET_NAME,
      Key: "cat.pdf", // File name you want to save as in S3
      Body: Buffer.from(pdfBytes),
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        console.log(err);
        throw err;
      }

      var mailOptions = {
        from: "andrei133303@gmail.com",
        to: "dcuan17@yahoo.com",
        subject: "Buna! Declaratia de azi!",
        text: "Aici este declaratia ta " + data.Location,
      };
      console.log(`File uploaded successfully. ${data.Location}`);

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return error;
        } else {
          console.log("Email sent: " + info.response);
          return true;
        }
      });
      console.log(`File sent successfully. ${data.Location}`);
    });
    console.log("bulangiu");
  }

  return await createPdf();
};
exports.handler = async (event) => {
  return await awsF();
};
