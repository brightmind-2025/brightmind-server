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

      // ❗ Check if this layout type already exists
      const existingLayout = await LayoutModel.findOne({ type });

      if (existingLayout) {
        return next(new ErrorHandler(`${type} layout already exists`, 400));
      }

      let layoutData: any = { type };

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        layoutData.banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
      } else if (type === "FAQ") {
        const { faq } = req.body;
        layoutData.faq = faq;
      } else if (type === "Categories") {
        const { categories } = req.body;
        layoutData.categories = categories;
      } else {
        return next(new ErrorHandler("Invalid layout type", 400));
      }

      const layout = await LayoutModel.create(layoutData);

      res.status(201).json({
        success: true,
        message: "Layout created successfully",
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
//edit layout

export const editLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      if (type === "Banner") {
        const bannerData: any = await LayoutModel.findOne({ type: "Banner" });
        const { image, title, subTitle } = req.body;
        if (bannerData) {
          await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
        }

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });
        const banner = {
          type: "Banner",
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };
        await LayoutModel.findByIdAndUpdate(bannerData?._id, { banner });
      }
      if (type === "FAQ") {
        const { faq } = req.body;
        const faqItem = await LayoutModel.findOne({ type: "FAQ" });
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(faqItem?._id, {
          type: "FAQ",
          faq: faqItems,
        });
      }
      if (type === "Categories") {
        const { categories } = req.body;
        const categoryData = await LayoutModel.findOne({ type: "Categories" });
        const categoryItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(categoryData?._id, {
          type: "Categories",
          categories: categoryItems,
        });
      }
      res.status(201).json({
        success: true,
        message: "Layout updated successfully",
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
      const { type } = req.body;
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
