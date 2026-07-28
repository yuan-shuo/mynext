import { APIRequestContext } from "@playwright/test";

const MAILPIT_API = process.env.MAILPIT_API || "http://localhost:8025";

export interface Email {
  ID: string;
  MessageID: string;
  Read: boolean;
  From: { Name: string; Address: string };
  To: Array<{ Name: string; Address: string }>;
  Subject: string;
  Created: string;
  Snippet: string;
  HTML?: string;
  Text?: string;
}

export class MailpitHelper {
  constructor(private request: APIRequestContext) {}

  /**
   * 获取所有邮件列表
   */
  async getMessageList(): Promise<any> {
    const response = await this.request.get(`${MAILPIT_API}/api/v1/messages`);
    const data = await response.json();
    return data;
  }

  /**
   * 获取单封邮件的完整内容
   */
  async getMessageContent(id: string): Promise<any> {
    const response = await this.request.get(
      `${MAILPIT_API}/api/v1/message/${id}`
    );
    const data = await response.json();
    return data;
  }

  /**
   * 获取特定收件人的最新邮件完整内容
   */
  async getLatestEmailByRecipient(email: string): Promise<any | null> {
    // 先获取邮件列表
    const list = await this.getMessageList();
    const messages = list.messages || [];

    // 过滤出目标收件人的邮件
    const filtered = messages
      .filter((e: any) => {
        const toList = Array.isArray(e.To) ? e.To : [e.To];
        return toList.some((to: any) => to.Address === email);
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.Created).getTime() - new Date(a.Created).getTime()
      );

    if (filtered.length === 0) {
      return null;
    }

    // 获取完整邮件内容
    const fullEmail = await this.getMessageContent(filtered[0].ID);
    return fullEmail;
  }

  /**
   * 等待新邮件到达
   */
  async waitForEmail(recipient: string, timeout: number = 30000): Promise<any> {
    const startTime = Date.now();
    const interval = 2000;

    while (Date.now() - startTime < timeout) {
      const email = await this.getLatestEmailByRecipient(recipient);
      if (email) {
        return email;
      }
      await this.sleep(interval);
    }
    throw new Error(`Timeout waiting for email to ${recipient}`);
  }

  /**
   * 从邮件内容中提取验证链接
   */
  extractVerificationLink(email: any): string | null {
    // 获取 HTML 内容
    const html = email.HTML || "";
    const text = email.Text || "";

    console.log("HTML 内容长度:", html.length);
    console.log("Text 内容长度:", text.length);

    // 从 HTML 中提取
    if (html) {
      // 方法1：查找 data-testid
      const testIdMatch = html.match(
        /data-testid="verification-link"[^>]*href="([^"]*)"/
      );
      if (testIdMatch && testIdMatch[1]) {
        return testIdMatch[1];
      }

      // 方法2：查找 href 属性
      const hrefMatch = html.match(
        /href="(http:\/\/localhost:3000\/api\/auth\/verify-request[^"]*)"/
      );
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }
    }

    // 从纯文本中提取
    if (text) {
      const textMatch = text.match(
        /http:\/\/localhost:3000\/api\/auth\/verify-request[^\s]*/
      );
      if (textMatch) {
        return textMatch[0];
      }
    }

    return null;
  }

  /**
   * 从邮件内容中提取重置密码链接
   */
  extractResetLink(email: any): string | null {
    const html = email.HTML || "";
    const text = email.Text || "";

    if (html) {
      const testIdMatch = html.match(
        /data-testid="reset-password-link"[^>]*href="([^"]*)"/
      );
      if (testIdMatch && testIdMatch[1]) {
        return testIdMatch[1];
      }

      const hrefMatch = html.match(
        /href="(http:\/\/localhost:3000\/auth\/reset-password[^"]*)"/
      );
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }
    }

    if (text) {
      const textMatch = text.match(
        /http:\/\/localhost:3000\/auth\/reset-password[^\s]*/
      );
      if (textMatch) {
        return textMatch[0];
      }
    }

    return null;
  }

  /**
   * 从邮件内容中提取换绑邮箱链接
   */
  extractChangeEmailLink(email: any): string | null {
    const html = email.HTML || "";
    const text = email.Text || "";

    if (html) {
      const testIdMatch = html.match(
        /data-testid="change-email-link"[^>]*href="([^"]*)"/
      );
      if (testIdMatch && testIdMatch[1]) {
        return testIdMatch[1];
      }

      const hrefMatch = html.match(
        /href="(http:\/\/localhost:3000\/api\/auth\/change-email[^"]*)"/
      );
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }
    }

    if (text) {
      const textMatch = text.match(
        /http:\/\/localhost:3000\/api\/auth\/change-email[^\s]*/
      );
      if (textMatch) {
        return textMatch[0];
      }
    }

    return null;
  }

  /**
   * 清除所有邮件
   */
  async clearAllEmails(): Promise<void> {
    await this.request.delete(`${MAILPIT_API}/api/v1/messages`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
