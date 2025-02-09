import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import adminProductsSlice from "./admin/products-slice";
import adminCategoriesSlice from "./admin/categories-slice";
import adminBannersSlice from "./admin/banners-slice";
import adminInstaFeedSlice from "./admin/instafeed-slice";
import adminFeedbackSlice from "./admin/feedback-slice";
import adminOrderSlice from "./admin/order-slice";
import adminDashboardSlice from "./admin/dashboard-slice";
import shopProductsSlice from "./shop/products-slice";
import shoppingCategoriesSlice from "./shop/categories-slice";
import shoppingBannersSlice from "./shop/banners-slice";
import shoppingInstaFeedSlice from "./shop/instafeed-slice";
import shopFeedbackSlice from "./shop/feedback-slice";
import shopCartSlice from "./shop/cart-slice";
import shopAddressSlice from "./shop/address-slice";
import shopOrderSlice from "./shop/order-slice";
import shopSearchSlice from "./shop/search-slice";
import shopReviewSlice from "./shop/review-slice";


const store = configureStore({
  reducer: {
    auth: authReducer,

    adminProducts: adminProductsSlice,
    adminCategories: adminCategoriesSlice,
    adminBanners: adminBannersSlice,
    adminInstaFeed: adminInstaFeedSlice,
    adminFeedback: adminFeedbackSlice,
    adminOrder: adminOrderSlice,
    adminDashboard: adminDashboardSlice,

    shopProducts: shopProductsSlice,
    shopCategories: shoppingCategoriesSlice,
    shopBanners: shoppingBannersSlice,
    shopInstaFeed: shoppingInstaFeedSlice,
    shopFeedback: shopFeedbackSlice,
    shopCart: shopCartSlice,
    shopAddress: shopAddressSlice,
    shopOrder: shopOrderSlice,
    shopSearch: shopSearchSlice,
    shopReview: shopReviewSlice,
  },
});

export default store;
