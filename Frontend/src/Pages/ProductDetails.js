import React, { useEffect, useState } from "react";
import axios from "axios";
import Comments from "../Components/Comments";
import Details from "../Components/Details";
import Footer from "../Components/Footer";
import Headers from "../Components/Header/index";
import New from "../Section/New";
import { withProductContext } from "../context/Product";
import { useNavigate, useParams } from "react-router-dom";
import { BackendLink } from "../link";

function ProductDetails() {
  let navigate = useNavigate();
  let { id } = useParams();
  const [RelatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const onPopState = () => {
      navigate("/Category");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // This makes the scrolling smooth
    });
  }, [])

  useEffect(() => {
    axios
      .get(`${BackendLink}/RelatedProducts/${id}`)
      .then((res) => {
        if (res?.data?.status == 200) {
          setRelatedProducts(res?.data?.data || []);
        }
      })
      .catch(() => { });
  }, [id])

  return (
    <React.Fragment>
      <div className="relative min-h-screen bg-white">

        <Headers />
        <div className="relative z-10 w-full flex items-center justify-center my-10 md:my-[4%]">
          <div className="w-[92%] max-w-7xl flex flex-col gap-8">
            <div className="bg-white rounded-2xl border border-[#d2d2d7] p-5 md:p-10">
              <Details />
            </div>
            <Comments productId={id} />
            {RelatedProducts?.length > 0 && (
              <New
                ProductsArr={RelatedProducts}
                heading={"View Related Products"}
                subHeading={"Whats new?"}
              />
            )}
          </div>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
}
export default withProductContext(ProductDetails);
