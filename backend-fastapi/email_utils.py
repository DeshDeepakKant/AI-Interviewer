import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import asyncio

def get_smtp_credentials():
    return os.getenv("SMTP_EMAIL"), os.getenv("SMTP_PASSWORD")

def _send_email_sync(to_email: str, subject: str, html_content: str):
    email_user, email_pass = get_smtp_credentials()
    if not email_user or not email_pass:
        print("SMTP Credentials not set. Skipping email send.")
        return
        
    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = email_user
    msg['To'] = to_email

    part = MIMEText(html_content, 'html')
    msg.attach(part)

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(email_user, email_pass)
        server.sendmail(email_user, to_email, msg.as_string())
        server.quit()
        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}. Error: {e}")

async def send_interview_invite(candidate_email: str, candidate_name: str, job_title: str, employer_name: str, invite_link: str):
    subject = f"Interview Invitation: {job_title} at {employer_name}"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #2c3e50;">Interview Invitation</h2>
          <p>Dear {candidate_name},</p>
          <p>You have been invited by <strong>{employer_name}</strong> to take an AI-powered technical interview for the position of <strong>{job_title}</strong>.</p>
          <p>This interview will dynamically adapt to your answers and test your fundamentals and problem-solving skills.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{invite_link}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Your Interview</a>
          </div>
          <p style="font-size: 0.9em; color: #7f8c8d;">If the button doesn't work, copy and paste this link into your browser: <br>{invite_link}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #95a5a6;">Powered by AI Interviewer Platform</p>
        </div>
      </body>
    </html>
    """
    await asyncio.to_thread(_send_email_sync, candidate_email, subject, html_content)

async def send_completion_notice(employer_email: str, candidate_name: str, job_title: str):
    subject = f"Candidate Completed Interview: {candidate_name} for {job_title}"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Interview Completed</h2>
        <p>Your candidate, <strong>{candidate_name}</strong>, has just completed their AI interview for the <strong>{job_title}</strong> position.</p>
        <p>You can now log in to your Employer Dashboard to view their detailed scorecard, technical analysis, and interview transcript.</p>
      </body>
    </html>
    """
    await asyncio.to_thread(_send_email_sync, employer_email, subject, html_content)
