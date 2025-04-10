import fs from 'fs';
import path from 'path';
import { SimulationData } from '@/types';

// Define types for cache structure
interface CacheEntry {
  data: SimulationData;
  addedAt: string;
}

interface CacheFile {
  cases: CacheEntry[];
  lastUpdated: string;
}

// Define the path for the cache file
const CACHE_FILE = path.join(process.cwd(), 'caseCache.json');

// Function to initialize the cache file if it doesn't exist
export function initializeCache(): void {
  try {
    // Create cache file if it doesn't exist or is empty/invalid
    let needsInit = false;
    
    if (!fs.existsSync(CACHE_FILE)) {
      needsInit = true;
    } else {
      try {
        const content = fs.readFileSync(CACHE_FILE, 'utf8');
        // If file is empty or contains invalid JSON
        if (!content.trim() || content.trim() === '') {
          needsInit = true;
        } else {
          // Try to parse JSON
          const cache = JSON.parse(content);
          // Check if it has the expected structure
          if (!cache || typeof cache !== 'object' || !Array.isArray(cache.cases)) {
            needsInit = true;
          }
        }
      } catch (readError) {
        console.error('Error reading cache file:', readError);
        needsInit = true;
      }
    }
    
    if (needsInit) {
      const initialCache: CacheFile = {
        cases: [],
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(CACHE_FILE, JSON.stringify(initialCache, null, 2));
      console.log('Cache file created or reset successfully');
    }
  } catch (error) {
    console.error('Failed to initialize cache file:', error);
  }
}

// Function to save a case to the cache
export function saveCaseToCache(caseData: SimulationData): void {
  try {
    // Initialize cache if it doesn't exist
    initializeCache();
    
    // Read existing cache
    let cache: CacheFile = { cases: [], lastUpdated: new Date().toISOString() };
    try {
      const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');
      if (cacheContent.trim()) {
        const parsedCache = JSON.parse(cacheContent) as CacheFile;
        // Ensure the cases array exists
        if (parsedCache && parsedCache.cases && Array.isArray(parsedCache.cases)) {
          cache = parsedCache;
        }
      }
    } catch (readError) {
      console.error('Error reading cache file, creating new cache:', readError);
      // Continue with empty cache
    }
    
    // Add new case to cache
    const entry: CacheEntry = {
      data: caseData,
      addedAt: new Date().toISOString()
    };
    cache.cases.push(entry);
    
    // Keep only the last 10 cases
    if (cache.cases.length > 10) {
      cache.cases = cache.cases.slice(-10);
    }
    
    // Update cache file
    cache.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    
    console.log('Case saved to cache successfully');
  } catch (error) {
    console.error('Failed to save case to cache:', error);
  }
}

// Function to get a random case from the cache
export function getRandomCaseFromCache(): SimulationData | null {
  try {
    // Check if cache file exists
    if (!fs.existsSync(CACHE_FILE)) {
      console.log('Cache file does not exist');
      initializeCache();
      return null;
    }
    
    // Read cache file
    let cache: CacheFile;
    try {
      const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');
      if (!cacheContent.trim()) {
        console.log('Cache file is empty, initializing');
        initializeCache();
        return null;
      }
      
      cache = JSON.parse(cacheContent) as CacheFile;
    } catch (parseError) {
      console.error('Error parsing cache file, resetting cache:', parseError);
      initializeCache();
      return null;
    }
    
    // If cache is empty or invalid, return null
    if (!cache || !cache.cases || !Array.isArray(cache.cases) || cache.cases.length === 0) {
      console.log('Cache is empty or invalid');
      return null;
    }
    
    // Get a random case from cache
    const randomIndex = Math.floor(Math.random() * cache.cases.length);
    return cache.cases[randomIndex].data;
  } catch (error) {
    console.error('Failed to get random case from cache:', error);
    return null;
  }
} 