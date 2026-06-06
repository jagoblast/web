import { createRoute } from 'honox/factory';

export default createRoute(async (c) => {
  let images: any[] = [];

  try {
    // Membaca langsung dari tabel database yang sekarang sudah dicatat oleh api/upload
    const { results } = await c.env.DB.prepare("SELECT * FROM media_assets ORDER BY created_at DESC").all();
    images = results || [];
  } catch (e) {
    console.log("Database table media_assets not found or empty.");
  }

  return c.render(
    <div class="max-w-[1200px] mx-auto py-10 px-6">
      <div class="mb-12 border-b border-neutral-100 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-serif italic tracking-widest uppercase">Media Library</h1>
          <p class="text-[10px] text-neutral-400 uppercase tracking-[0.3em] mt-2">Upload assets directly to CDN</p>
        </div>
      </div>

      {/* UPLOAD SECTION */}
      <div class="bg-neutral-50 border border-neutral-100 p-8 mb-16 shadow-sm">
        <h3 class="text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Upload New Image</h3>
        <form id="upload-form" class="flex flex-col md:flex-row items-center gap-6">
          <input 
            type="file" 
            id="file-input"
            accept="image/*" 
            class="block w-full text-xs text-neutral-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[9px] file:font-bold file:uppercase file:tracking-widest file:bg-black file:text-white hover:file:bg-neutral-800 transition cursor-pointer bg-white border border-neutral-200 p-2"
            required
          />
          <button type="submit" id="upload-btn" class="w-full md:w-auto shrink-0 bg-neutral-200 text-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-300 transition-all">
            Upload Asset
          </button>
        </form>
        <p id="upload-status" class="text-[10px] uppercase tracking-widest text-green-600 mt-4 hidden font-bold">Uploading...</p>
      </div>

      {/* GALLERY SECTION */}
      <div class="space-y-6">
        <h3 class="text-[10px] font-bold uppercase tracking-[0.3em] border-b border-neutral-100 pb-4">Asset Gallery</h3>
        
        {images.length === 0 ? (
          <div class="py-20 text-center border border-neutral-100 bg-neutral-50">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">No images uploaded yet. Upload your first banner above.</p>
          </div>
        ) : (
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {images.map((img) => (
              <div class="group border border-neutral-100 bg-white shadow-sm flex flex-col relative">
                <div class="aspect-square w-full overflow-hidden bg-neutral-50 border-b border-neutral-100 relative flex items-center justify-center">
                  
                  {/* Load dari public_url yang tersimpan di database */}
                  <img src={img.public_url} class="w-full h-full object-cover" loading="lazy" alt={img.file_name} />
                  
                  <button type="button" onclick={`deleteImage('${img.id}')`} class="absolute top-2 right-2 bg-red-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 opacity-0 group-hover:opacity-100 transition-all shadow-md">
                    DEL
                  </button>
                </div>
                <div class="p-4 flex flex-col justify-between flex-1 space-y-4">
                  <div>
                    <p class="text-[8px] font-bold text-neutral-400 uppercase tracking-widest truncate" title={img.file_name}>
                      {img.file_name}
                    </p>
                    <p class="text-[8px] text-neutral-300 mt-1">{img.size_kb.toFixed(1)} KB</p>
                  </div>
                  
                  <button 
                    type="button" 
                    onclick={`copyUrl(this, '${img.public_url}')`}
                    class="w-full border border-black py-2 text-[8px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('upload-form').onsubmit = async (e) => {
          e.preventDefault();
          const fileInput = document.getElementById('file-input');
          const status = document.getElementById('upload-status');
          const btn = document.getElementById('upload-btn');
          
          if(!fileInput.files.length) return;

          status.style.display = 'block';
          status.className = 'text-[10px] uppercase tracking-widest text-neutral-500 mt-4 font-bold';
          status.innerText = 'Uploading to Server...';
          btn.disabled = true;

          const formData = new FormData();
          formData.append('file', fileInput.files[0]);

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const data = await res.json();
            
            if(data.success) {
              window.location.reload();
            } else {
              alert('Upload failed: ' + (data.message || 'Error'));
              status.style.display = 'none';
              btn.disabled = false;
            }
          } catch(err) {
            alert('Network error. Check your connection.');
            status.style.display = 'none';
            btn.disabled = false;
          }
        };

        window.copyUrl = function(btn, url) {
          navigator.clipboard.writeText(url).then(() => {
            const originalText = btn.innerText;
            btn.innerText = 'COPIED!';
            btn.classList.add('bg-black', 'text-white');
            setTimeout(() => {
              btn.innerText = originalText;
              btn.classList.remove('bg-black', 'text-white');
            }, 2000);
          });
        };

        window.deleteImage = async function(id) {
          if(!confirm('Remove this asset from database?')) return;
          
          const res = await fetch('/api/media-delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          
          if(res.ok) {
            window.location.reload();
          } else {
            alert('Failed to delete asset.');
          }
        };
      `}} />
    </div>,
    { title: 'Media Library | Admin' }
  );
});