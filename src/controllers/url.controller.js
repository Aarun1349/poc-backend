import { asyncHandlerPromiseVersion } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Url } from "../models/url.model.js";
import { urlShortner } from "../utils/UrlShortening.js";
export const convertUrl = asyncHandlerPromiseVersion(async (req, res) => {
  const url = req.body.url;
  if (!url) {
    throw new ApiError("404", "please provide url to convert");
  }
  const foundUrl = await Url.findOne(url);
  if (foundUrl) {
    return res.status(202).send(
      new ApiResponse(200, {
        message: "Already converted",
        url: url,
        short_url: foundUrl.itsy_bitsy_url,
      })
    );
  }
  const itsy_bitsy_url = urlShortner(url);

  if (!itsy_bitsy_url) {
    throw new ApiError("500", "Something went wrong");
  }
  const newShortUrl = await Url.create({
    url: url,
    itsy_bitsy_url: newShortUrl,
  });
  if (!newShortUrl) {
    throw new ApiError("500", "Something went wrong in db");
  }

  return res.status(200).send(
    new ApiResponse(200, {
      message: "success",
      newShortUrl,
    })
  );
});
