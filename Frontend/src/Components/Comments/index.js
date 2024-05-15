import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import swal from "sweetalert";
import { FaUserCircle, FaStar, FaRegStar } from "react-icons/fa";
import { withAuthContext } from "../../context/Auth";
import { BackendLink } from "../../link";

function StarPicker({ value, onChange }) {
    return (
        <div className="flex text-[#f97316] text-2xl gap-1">
            {[1, 2, 3, 4, 5].map((s) =>
                s <= value ? (
                    <FaStar key={s} className="cursor-pointer" onClick={() => onChange(s)} />
                ) : (
                    <FaRegStar key={s} className="cursor-pointer" onClick={() => onChange(s)} />
                )
            )}
        </div>
    );
}

function Comments({ productId, Token, currUser }) {
    const [Reviews, setReviews] = useState([]);
    const [Loading, setLoading] = useState(true);
    const [Rating, setRating] = useState(0);
    const [Comment, setComment] = useState("");
    const [Submitting, setSubmitting] = useState(false);

    const GetReviews = () => {
        if (!productId) return;
        setLoading(true);
        axios
            .get(`${BackendLink}/GetApprovedReviews/Product/${productId}`)
            .then((res) => {
                setLoading(false);
                if (res?.data?.status == 200) {
                    setReviews(res?.data?.data || []);
                }
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        GetReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const handleSubmit = () => {
        if (!(Token || localStorage.getItem("token"))) {
            swal({
                text: "Please sign in to leave a review",
                button: { text: "Ok", closeModal: true },
                icon: "warning",
            });
            return;
        }
        if (!Rating || !Comment) {
            swal({
                text: "Please add a rating and a comment",
                button: { text: "Ok", closeModal: true },
                icon: "warning",
            });
            return;
        }
        setSubmitting(true);
        axios
            .post(
                `${BackendLink}/Create-Review`,
                {
                    targetType: "Product",
                    targetId: productId,
                    rating: Rating,
                    comment: Comment,
                },
                {
                    headers: {
                        Authorization: Token ? `${Token}` : `${localStorage.getItem("token")}`,
                    },
                }
            )
            .then((res) => {
                setSubmitting(false);
                swal({
                    text: res?.data?.message || "Thanks! Your review will appear once approved.",
                    button: { text: "Ok", closeModal: true },
                    icon: res?.data?.status == 200 ? "success" : "error",
                });
                if (res?.data?.status == 200) {
                    setRating(0);
                    setComment("");
                }
            })
            .catch((err) => {
                setSubmitting(false);
                swal({
                    text: err?.response?.data?.message || "There was some error submitting your review",
                    button: { text: "Ok", closeModal: true },
                    icon: "error",
                });
            });
    };

    return (
        <div className="self-stretch p-6 md:p-10 relative max-w-full bg-white rounded-2xl border border-[#d2d2d7] mt-4">
            <h2 className="text-xl md:text-2xl font-semibold text-[#1d1d1f] flex items-end gap-2">
                Customer Reviews
                {Reviews?.length > 0 && (
                    <span className="text-sm font-medium text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1 rounded-full">
                        {Reviews.length}
                    </span>
                )}
            </h2>

            <div className="flex flex-col items-start justify-start max-w-full mt-4 w-full divide-y divide-[#f0f0f2]">
                {Loading ? (
                    <p className="text-[#86868b] text-sm py-4">Loading reviews...</p>
                ) : Reviews?.length > 0 ? (
                    Reviews.map((r) => (
                        <div key={r?._id} className="w-full py-5 first:pt-0">
                            <div className="flex justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <FaUserCircle className="text-[36px] text-[#d2d2d7]" />
                                    <div>
                                        <p className="font-medium text-sm text-[#1d1d1f]">
                                            {r?.user?.name || "Anonymous"}
                                        </p>
                                        <div className="flex text-[#f97316] text-xs gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) =>
                                                s <= (r?.rating || 0) ? <FaStar key={s} /> : <FaRegStar key={s} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-[#86868b] whitespace-nowrap">
                                    {moment(r?.created_at).fromNow()}
                                </p>
                            </div>
                            <p className="mt-3 text-sm text-[#6e6e73] leading-relaxed">
                                {r?.comment}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-[#86868b] text-sm py-4">No reviews yet. Be the first to review this product!</p>
                )}
            </div>

            {/* Submission Form */}
            <div className="w-full mt-8 p-6 rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7]">
                <h3 className="text-base font-semibold text-[#1d1d1f] mb-3">Write a Review</h3>
                <StarPicker value={Rating} onChange={setRating} />
                <textarea
                    value={Comment}
                    onChange={(e) => setComment(e?.target?.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full mt-4 p-4 rounded-xl border border-[#d2d2d7] focus:border-[#f97316] outline-none text-sm bg-white transition-colors duration-200"
                    rows={3}
                />
                <button
                    onClick={handleSubmit}
                    disabled={Submitting}
                    className="mt-4 px-8 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-50"
                >
                    {Submitting ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </div>
    );
}
export default withAuthContext(Comments);
