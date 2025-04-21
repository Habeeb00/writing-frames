const { createClient } = require('@supabase/supabase-js');

// Use hardcoded values to ensure they're available at runtime
const supabaseUrl = 'https://difuqmmmvrzieksvhpwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZnVxbW1tdnJ6aWVrc3ZocHdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDE0MTksImV4cCI6MjA2MDQ3NzQxOX0.oE6IpUh3lmWy_jVRukxf76ZuilCzy8tHFlIx0IGT21s';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndCreateBucket() {
  try {
    console.log('Checking if writing-frames bucket exists...');
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'writing-frames');
    
    if (bucketExists) {
      console.log('writing-frames bucket already exists');
    } else {
      console.log('writing-frames bucket does not exist, creating it...');
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('writing-frames', {
        public: true
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Bucket created successfully:', data);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkAndCreateBucket(); 