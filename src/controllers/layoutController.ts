import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../lib/util/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import LayoutModel from "../models/layoutModel";
import cloudinary from "cloudinary";

//create layout

export const createLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} already exists`, 400));
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          type: "Banner",
          banner: {
            image: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            },
            title,
            subTitle,
          },
        };
        await LayoutModel.create(banner);
      } else if (type === "FAQ") {
        const { faq } = req.body;
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await LayoutModel.create({ type: "FAQ", faq: faqItems });
      } else if (type === "Categories") {
        const { categories } = req.body;
        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({
          type: "Categories",
          categories: categoriesItems,
        });
      }

      res.status(200).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//edit layout

export const editLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      if (type === "Banner") {
        const bannerData = await LayoutModel.findOne({ type: "Banner" });
        const { image, title, subTitle } = req.body;

        let newImageData = { public_id: "", url: "" };

        if (image) {
          if (image.startsWith("https")) {
            // Access image array correctly
            newImageData = Array.isArray(bannerData?.banner?.image) ? bannerData?.banner?.image[0] : {
              public_id: "",
              url: "",
            };
          } else {
            const uploadedImage = await cloudinary.v2.uploader.upload(image, {
              folder: "layout",
            });
            newImageData = {
              public_id: uploadedImage.public_id,
              url: uploadedImage.secure_url,
            };
          }
        }

        const banner = {
          title: title || bannerData?.banner?.title,
          subTitle: subTitle || bannerData?.banner?.subTitle,
          image: [newImageData], // Maintain array structure
        };

        await LayoutModel.findByIdAndUpdate(bannerData?._id, { banner });
      } else if (type === "FAQ") {
        const { faq } = req.body;
        const FaqItem = await LayoutModel.findOne({ type: "FAQ" });

        const faqItems = await Promise.all(
          faq.map(async (item: any) => ({
            question: item.question,
            answer: item.answer,
          }))
        );

        await LayoutModel.findByIdAndUpdate(FaqItem?._id, {
          faq: faqItems,
        });
      } else if (type === "Categories") {
        const { categories } = req.body;
        const categoriesData = await LayoutModel.findOne({
          type: "Categories",
        });

        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => ({
            title: item.title,
          }))
        );

        await LayoutModel.findByIdAndUpdate(categoriesData?._id, {
          categories: categoriesItems,
        });
      }

      res.status(200).json({
        success: true,
        message: "Layout Updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get layout by type
export const getLayoutByType = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params; // Extract 'type' from URL parameters
      const layout = await LayoutModel.findOne({ type });
      if (!layout) {
        return next(new ErrorHandler("Layout not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Layout fetched successfully",
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
