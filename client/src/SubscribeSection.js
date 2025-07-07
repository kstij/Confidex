import React from 'react';

const SubscribeSection = () => (
  <section className="subscribe-section">
    <div className="subscribe-content">
      <h2 className="subscribe-title">
        <b>Stronger Teams.</b><br />
        <b>Smarter Workplaces.</b><br />
        <b>Together.</b>
      </h2>
      <form className="subscribe-form">
        <input type="email" className="subscribe-input" placeholder="Enter your email" />
        <button type="submit" className="subscribe-btn">Subscribe</button>
      </form>
    </div>
  </section>
);

export default SubscribeSection; 