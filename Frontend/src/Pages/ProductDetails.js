import React, { useEffect } from "react";
import Comments from "../Components/Comments";
import Details from "../Components/Details";
import Footer from "../Components/Footer";
import Headers from "../Components/Header/index";
import New from "../Section/New";
import { withProductContext } from "../context/Product";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function ProductDetails({ AllProduct, shuffleArr }) {
  let location = useLocation();
  let navigate = useNavigate();
  let { id } = useParams();

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
            <New
              ProductsArr={shuffleArr(AllProduct).sort(() => Math.random() - 0.1).slice(
                0,
                4
              )}
              heading={"View Related Products"}
              subHeading={"Whats new?"}
            />
          </div>
        </div>
        <Footer />
      </div>
    </React.Fragment>
  );
}
export default withProductContext(ProductDetails);
