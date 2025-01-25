export class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private tokensPerInterval: number;
    private interval: number;
    private timeout: number;
  
    constructor({
      tokensPerInterval = 10,
      interval = 60000, // 1 minute in ms
      timeout = 5000
    } = {}) {
      this.tokens = tokensPerInterval;
      this.lastRefill = Date.now();
      this.tokensPerInterval = tokensPerInterval;
      this.interval = interval;
      this.timeout = timeout;
    }
  
    async getToken(): Promise<void> {
      const now = Date.now();
      const timePassed = now - this.lastRefill;
      
      if (timePassed >= this.interval) {
        this.tokens = this.tokensPerInterval;
        this.lastRefill = now;
      }
  
      if (this.tokens <= 0) {
        await new Promise(resolve => setTimeout(resolve, this.timeout));
        return this.getToken();
      }
  
      this.tokens--;
    }
  }
  
  export const rateLimiter = new RateLimiter();