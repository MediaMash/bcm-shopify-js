// pages/index.js
import { Page } from '@shopify/polaris';

const Index = () => (
  <Page>
    <div style={{ padding: '20px' }}>
      <h1>Customize Your Landing Page</h1>
      <form>
        <label htmlFor="imageUrl">Image URL:</label>
        <input type="text" id="imageUrl" name="imageUrl" />

        <label htmlFor="videoUrl">Video URL:</label>
        <input type="text" id="videoUrl" name="videoUrl" />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  </Page>
);

export default Index;
