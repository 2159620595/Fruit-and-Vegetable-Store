<!-- src/components/Footer.vue -->
<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Fresh Harvest</h4>
          <p>Fresh, organic produce delivered to your door</p>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/about">About Us</router-link></li>
            <li><router-link to="/contact">Contact</router-link></li>
            <li><router-link to="/faq">FAQ</router-link></li>
            <li><router-link to="/privacy">Privacy Policy</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><router-link to="/shipping">Shipping Info</router-link></li>
            <li><router-link to="/returns">Returns</router-link></li>
            <li><router-link to="/terms">Terms of Service</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4>Follow Us</h4>
          <div class="social-links">
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 Fresh Harvest. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #f8f9fa;
  padding: 3rem 0 1rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #666;
  text-decoration: none;
}

.footer-section a:hover {
  color: #00c853;
}

.footer-bottom {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
  color: #666;
}

.social-links {
  display: flex;
  gap: 1rem;
}
</style>