import React from "react";
import "./FeaturesSection.css";

function FeaturesSection() {
  return (
    <section className="weare-us-section">
      <div className="heading">Why Confidex?</div>
      <div className="weare-us-container-1 we1">
        <div className="weare-us-info-1">
          <div className="weare-us-info-box">
            <div className="info-square">1</div>
            <div className="info-rect"></div>
          </div>
          <p className="info-header">Anonymity with Accountability</p>
          <p className="info-text">
          We ensure every response stays anonymous while giving you visibility into who participated. This balance promotes honesty without compromising privacy.
          </p>
        </div>
        <div className="weare-us-image-section-1">
          <div className="weare-us-image-box">
            <img
              src="assets/anonymous.png"
              alt="weare Us"
              className="weare-us-image"
            />
          </div>
        </div>
      </div>
      <div className="weare-us-container-2 we2">
        <div className="weare-us-image-section-2">
          <div className="weare-us-image-box">
            <img
              src="assets/insights.png"
              alt="weare Us"
              className="weare-us-image"
            />
          </div>
        </div>
        <div className="weare-us-info-2">
          <div className="weare-us-info-box">
            <div className="info-square">2</div>
            <div className="info-rect"></div>
          </div>
          <p className="info-header">Insightful,Actionable Analytics</p>
          <p className="info-text">
          Gain powerful insights without breaching trust. Our system separates identities from responses, providing clean, bias-free data for smarter decisions.
          </p>
        </div>
      </div>
      <div className="weare-us-container-3 we3">
        <div className="weare-us-info-1">
          <div className="weare-us-info-box">
            <div className="info-square">3</div>
            <div className="info-rect"></div>
          </div>
          <p className="info-header">Build a Transparent Culture</p>
          <p className="info-text">
          Encourage open communication and continuous improvement. Empower your team to speak up and be heard, knowing their feedback is valued and protected.
          </p>
        </div>
        <div className="weare-us-image-section-1">
          <div className="weare-us-image-box">
            <img
              src="/assets/strongculture.png"
              alt="weare Us"
              className="weare-us-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection; 