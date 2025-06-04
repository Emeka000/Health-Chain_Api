import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LoadBalancerService {
  private healthChecks: Map<string, boolean> = new Map();
  private serverLoad: Map<string, number> = new Map();

  constructor() {
    // Initialize server monitoring
    this.initializeServers();
  }

  private initializeServers(): void {
    const servers = ['server-1', 'server-2', 'server-3'];
    servers.forEach(server => {
      this.healthChecks.set(server, true);
      this.serverLoad.set(server, 0);
    });
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async performHealthChecks(): Promise<void> {
    for (const [server] of this.healthChecks) {
      try {
        // Simulate health check
        const isHealthy = await this.checkServerHealth(server);
        this.healthChecks.set(server, isHealthy);
        
        if (!isHealthy) {
          console.warn(`Server ${server} is unhealthy`);
          await this.initiateFailover(server);
        }
      } catch (error) {
        console.error(`Health check failed for ${server}:`, error);
        this.healthChecks.set(server, false);
      }
    }
  }

  async getOptimalServer(): Promise<string> {
    // Get healthy servers with lowest load
    const healthyServers = Array.from(this.healthChecks.entries())
      .filter(([_, isHealthy]) => isHealthy)
      .map(([server]) => server);

    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }

    // Return server with lowest load
    return healthyServers.reduce((optimal, current) => {
      const currentLoad = this.serverLoad.get(current) || 0;
      const optimalLoad = this.serverLoad.get(optimal) || 0;
      return currentLoad < optimalLoad ? current : optimal;
    });
  }

  private async checkServerHealth(server: string): Promise<boolean> {
    // Simulate health check - in production, make actual HTTP calls
    const load = Math.random() * 100;
    this.serverLoad.set(server, load);
    
    // Consider server unhealthy if load > 90%
    return load < 90;
  }

  private async initiateFailover(failedServer: string): Promise<void> {
    console.log(`Initiating failover for ${failedServer}`);
    