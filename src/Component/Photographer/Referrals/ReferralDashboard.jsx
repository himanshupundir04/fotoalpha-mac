import React, { useState, useEffect } from "react";
import { CircleIcon, Copy, Share2, Download, Zap } from "lucide-react";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const ReferralDashboard = () => {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState({
    totalCoins: 0,
    earnedCoins: 0,
    usedCoins: 0,
    availableCoins: 0,
    totalReferralsGenerated: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch referral code and stats
      const statsResponse = await axios.get(`${baseURL}/referrals/my-code`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (statsResponse.data.success && statsResponse.data.data) {
        setReferralCode(statsResponse.data.data.referralCode);
        setReferralLink(statsResponse.data.data.referralLink);
        setStats({
          totalCoins: statsResponse.data.data.totalCoins,
          earnedCoins: statsResponse.data.data.earnedCoins,
          usedCoins: statsResponse.data.data.usedCoins,
          availableCoins: statsResponse.data.data.availableCoins,
          totalReferralsGenerated:
            statsResponse.data.data.totalReferralsGenerated,
          completedReferrals: statsResponse.data.data.completedReferrals,
          pendingReferrals: statsResponse.data.data.pendingReferrals,
        });
      }

      // Fetch referral history
      const historyResponse = await axios.get(`${baseURL}/referrals/history?limit=10`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (historyResponse.data.success && historyResponse.data.data) {
        setReferralHistory(historyResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `Join FotoAlpha and get 20 coins! 🎉 Use my referral code: ${referralCode}\n${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareEmail = () => {
    const subject = "Join FotoAlpha with My Referral Code";
    const body = `Hi!\n\nI'm using FotoAlpha and love it! You can join using my referral code and get 20 coins as a bonus.\n\nCode: ${referralCode}\n\nLink: ${referralLink}\n\nLooking forward to having you on board!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleGenerateCode = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${baseURL}/referrals/generate-code`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (response.data.success) {
        setReferralCode(response.data.data.referralCode);
        setReferralLink(response.data.data.referralLink);
        setSuccess("Referral code generated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "Failed to generate referral code");
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate referral code"
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin">
          <CircleIcon className="h-8 w-8 text-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 text-start">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue/5 via-white to-cyan-400/5 dark:from-slate-800/50 dark:via-slate-900 dark:to-slate-800/50 rounded-xl p-5 border border-blue/10 dark:border-slate-700/50 shadow-xl">
        <h1 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Your Referral Program
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Share your code and earn 50 coins for every friend who joins with an active subscription
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2.5 text-xs text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2.5 text-xs text-green-700 dark:text-green-400">
          ✓ {success}
        </div>
      )}

      {/* Referral Code Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Code Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-lg">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3.5">
            Your Referral Code
          </h2>

          {!referralCode ? (
            <div className="flex flex-col items-center justify-center py-7 space-y-2.5">
              <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue" />
              </div>
              <div className="text-center">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                  No Referral Code Yet
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3.5">
                  Generate your unique referral code to start earning coins by inviting friends
                </p>
                <button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="flex items-center justify-center gap-1.5 bg-blue hover:bg-blueHover text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="h-3 w-3" />
                  {generating ? "Generating..." : "Generate Referral Code"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Code Display */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700/50">
                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Code
                </p>
                <div className="flex flex-wrap items-center justify-between">
                  <p className="text-sm sm:text-xl font-bold text-blue tracking-wider">
                    {referralCode}
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition"
                    title="Copy code"
                  >
                    <Copy className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
                {copied && (
                  <p className="text-[9px] text-green-600 dark:text-green-400 mt-1">
                    ✓ Copied to clipboard
                  </p>
                )}
              </div>

              {/* Link Display */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 md:p-3.5 border border-slate-200 dark:border-slate-700/50">
                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Referral Link
                </p>
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="md:flex-1 bg-white w-full dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 text-xs text-slate-600 dark:text-slate-400 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition"
                    title="Copy link"
                  >
                    <Copy className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2.5">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md py-1.5 text-xs transition"
                >
                  <Share2 className="h-2.5 w-2.5 hidden sm:block" />
                  <span className="font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={handleShareEmail}
                  className="flex items-center justify-center gap-1.5 bg-blue hover:bg-blueHover text-white rounded-md py-1.5 text-xs transition"
                >
                  <Share2 className="h-2.5 w-2.5 hidden sm:block" />
                  <span className="font-medium">Email</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-lg space-y-2.5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Statistics
          </h2>

          <div className="space-y-2.5">
            {/* Total Coins */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-md p-2.5 border border-yellow-200 dark:border-yellow-800/30">
              <p className="text-[10px] text-yellow-700 dark:text-yellow-300 font-medium">
                Total Coins Earned
              </p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {stats.totalCoins}
              </p>
            </div>

            {/* Referrals */}
            <div className="bg-gradient-to-br from-blue/5 to-blue/10 dark:from-blue/20 dark:to-blue/10 rounded-md p-2.5 border border-blue/20 dark:border-blue/30">
              <p className="text-[10px] text-blue dark:text-blue-300 font-medium">
                Total Referrals
              </p>
              <p className="text-base font-bold text-blue dark:text-blue-400 mt-1">
                {stats.totalReferralsGenerated}
              </p>
              <p className="text-[9px] text-blue/70 dark:text-blue-300/70 mt-0.5">
                {stats.completedReferrals} completed, {stats.pendingReferrals}{" "}
                pending
              </p>
            </div>

            {/* Available Coins */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-md p-2.5 border border-green-200 dark:border-green-800/30">
              <p className="text-[10px] text-green-700 dark:text-green-300 font-medium">
                Available to Use
              </p>
              <p className="text-base font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.availableCoins}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-lg">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Recent Referrals
        </h2>

        {referralHistory.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You haven't referred anyone yet. Share your code to get started!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50">
                  <th className="text-left py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300">
                    Referred User
                  </th>
                  <th className="text-left py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300">
                    Email
                  </th>
                  <th className="text-left py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="text-left py-2 px-2.5 font-semibold text-slate-700 dark:text-slate-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {referralHistory.map((referral) => (
                  <tr
                    key={referral._id}
                    className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition"
                  >
                    <td className="py-2 px-2.5 text-slate-900 dark:text-white font-medium">
                      {referral.referredId?.name || "N/A"}
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400">
                      {referral.referredId?.email || "N/A"}
                    </td>
                    <td className="py-2 px-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium ${
                          referral.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        {referral.status === "completed" ? "✓ Completed" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 text-[9px]">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-blue/5 dark:bg-blue/10 rounded-xl p-5 border border-blue/10 dark:border-blue/20">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue text-white text-xs font-bold mb-1.5">
              1
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Share Your Code</span>
              <br />
              Copy and share your referral code with friends
            </p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue text-white text-xs font-bold mb-1.5">
              2
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-300">
              <span className="font-semibold">They Sign Up</span>
              <br />
              Your friend signs up with your code and takes subscription
            </p>
          </div>
          <div>
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue text-white text-xs font-bold mb-1.5">
              3
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-300">
              <span className="font-semibold">Earn Coins</span>
              <br />
              You get 50 coins, they get 20 coins!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
