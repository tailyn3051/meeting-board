# NPI Meeting Board (Simple Deployment)

This is a web application for visualizing NPI plans. This version is designed to be extremely simple to use and deploy without any special tools.

You can publish this application as a live public website using GitHub Pages in just a few steps.

---

## How to Deploy to GitHub

This method does not require installing any tools like Node.js or running any commands.

### Step 1: Create a GitHub Repository

1.  Go to [GitHub.com](https://github.com/) and create a **new public repository**.
2.  Name it whatever you like (e.g., `npi-board`).
3.  Click "Create repository".

### Step 2: Upload Your Files

1.  On your new repository's page, click the **"Add file"** button and choose **"Upload files"**.
2.  Drag and drop all of your project files (`index.html`, `index.tsx`, `App.tsx`, `types.ts`, and the `components` folder) into the upload area.
3.  Scroll down and click **"Commit changes"**.

### Step 3: Enable GitHub Pages

1.  In your repository, go to the **"Settings"** tab.
2.  In the left sidebar, click on **"Pages"**.
3.  Under "Build and deployment", for the **Source**, select **"Deploy from a branch"**.
4.  Set the branch to **`main`** (or `master`) and the folder to **`/ (root)`**.
5.  Click **"Save"**.

### Step 4: Visit Your Live Site!

After a minute or two, GitHub will publish your site. A green bar will appear on the Pages settings screen with the public URL. It will look something like this:

`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

That's it! Your application is now live and public.
