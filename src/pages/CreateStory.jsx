import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateStory = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    description: '',
    content: '',
    coverImage: null,
    audioFile: null,
    generateAudio: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories.map(c => c.name));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('category', formData.category);
      dataToSend.append('tags', formData.tags);
      dataToSend.append('description', formData.description);
      dataToSend.append('content', formData.content);
      dataToSend.append('generateAudio', formData.generateAudio);
      if (formData.coverImage) {
        dataToSend.append('coverImage', formData.coverImage);
      }
      if (formData.audioFile) {
        dataToSend.append('audioFile', formData.audioFile);
      }

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: dataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error publishing story');
      }

      // Simulate audio generation if requested
      if (formData.generateAudio) {
        setAudioGenerating(true);
        setTimeout(() => {
          setAudioGenerating(false);
          alert('Story published successfully with audio!');
          navigate('/author');
        }, 3000);
      } else {
        alert('Story published successfully!');
        navigate('/author');
      }
    } catch (error) {
      alert(error.message || 'Error publishing story');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'author') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center bg-slate-900/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
          <i className="fas fa-pen text-6xl text-slate-700 mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-white">Author Access Required</h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">You need to be registered as an author to share your stories with our community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-200 selection:bg-accent-500/30 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-bold mb-2 text-white font-serif tracking-tight">Craft Your Story</h1>
          <p className="text-slate-400 text-lg">
            Every word you write is a step into a new world. Share your vision.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Basic Information */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 group transition-all hover:border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl"></div>
            <h2 className="text-2xl font-bold mb-8 flex items-center text-white font-serif">
              <i className="fas fa-info-circle mr-3 text-primary-400"></i>Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-widest text-primary-400 ml-1">
                  Story Title *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-5 py-4 bg-slate-950 border border-white/10 rounded-2xl !text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                    placeholder="e.g., Whispers of the Ancient Wind"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  <i className="fas fa-heading absolute right-5 top-1/2 -translate-y-1/2 text-slate-600"></i>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-widest text-primary-400 ml-1">
                  Category *
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    className="w-full px-5 py-4 bg-slate-950 border border-white/10 rounded-2xl !text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="" className="bg-slate-900 text-slate-500">Choose a genre</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-slate-900">{category}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"></i>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-2">
              <label htmlFor="tags" className="block text-xs font-bold uppercase tracking-widest text-primary-400 ml-1">
                Tags (comma-separated)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="w-full px-5 py-4 bg-slate-950 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                  placeholder="e.g., adventure, mystery, epic"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <i className="fas fa-tags absolute right-5 top-1/2 -translate-y-1/2 text-slate-600"></i>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-primary-400 ml-1">
                Short Description
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="w-full px-5 py-4 bg-slate-950 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium resize-none"
                  placeholder="A brief summary to hook your readers..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                <i className="fas fa-quote-right absolute right-5 top-6 text-slate-600"></i>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 group transition-all hover:border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
            <h2 className="text-2xl font-bold mb-8 flex items-center text-white font-serif">
              <i className="fas fa-image mr-3 text-green-400"></i>Cover Image
            </h2>
            
            <div className="border-2 border-dashed border-white/10 group-hover:border-green-500/30 rounded-3xl p-12 text-center bg-slate-950/30 transition-all relative">
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="mb-6 relative">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
                  <i className="fas fa-cloud-upload-alt text-4xl text-slate-600 group-hover:text-green-400 transition-colors"></i>
                </div>
              </div>
              <p className="text-slate-400 mb-6 font-medium">
                Upload a captivating cover image for your story
              </p>
              <label
                htmlFor="coverImage"
                className="bg-slate-800 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer inline-flex items-center transition-all shadow-lg"
              >
                <i className="fas fa-file-image mr-2"></i>Choose File
              </label>
              {formData.coverImage && (
                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl inline-flex items-center">
                  <i className="fas fa-check-circle text-green-400 mr-2"></i>
                  <span className="text-sm text-green-400 font-bold">{formData.coverImage.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Story Content */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 group transition-all hover:border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold flex items-center text-white font-serif">
                <i className="fas fa-pen-fancy mr-3 text-purple-400"></i>Story Content
              </h2>
              <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                {[
                  { icon: 'fa-bold', label: 'B' },
                  { icon: 'fa-italic', label: 'I' },
                  { icon: 'fa-list-ul', label: 'List' },
                  { icon: 'fa-quote-left', label: 'Quote' }
                ].map((tool, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                    title={tool.icon.split('-')[1]}
                  >
                    <i className={`fas ${tool.icon} text-sm`}></i>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <textarea
                id="content"
                name="content"
                required
                rows="18"
                className="w-full px-8 py-8 bg-slate-950 border border-white/10 rounded-3xl !text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-serif text-xl leading-relaxed resize-none selection:bg-primary-500/30"
                placeholder="Once upon a time, in a world where words held the power to shape reality..."
                value={formData.content}
                onChange={handleChange}
              ></textarea>
              <div className="absolute bottom-6 right-8 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {formData.content.length} characters
                </div>
                <div className="w-px h-3 bg-slate-800"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary-400">
                  {formData.content.split(' ').filter(word => word.length > 0).length} words
                </div>
              </div>
            </div>
          </div>

          {/* Audio Enhancement Options */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl"></div>
            <h2 className="text-2xl font-bold mb-8 flex items-center text-white font-serif">
              <i className="fas fa-volume-up mr-3 text-accent-500"></i>Audio Options
            </h2>
            
            <div className="space-y-10">
              {/* Upload Recorded Audio */}
              <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 transition-all group hover:border-accent-500/30">
                <h4 className="font-bold text-white mb-4 flex items-center">
                  <i className="fas fa-microphone mr-2 text-rose-400"></i>Upload Your Recorded Audio
                </h4>
                <div className="relative">
                  <input
                    type="file"
                    id="audioFile"
                    name="audioFile"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <label
                      htmlFor="audioFile"
                      className="bg-slate-800 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer inline-flex items-center transition-all whitespace-nowrap shadow-lg active:scale-95"
                    >
                      <i className="fas fa-file-audio mr-2"></i>Select Audio
                    </label>
                    <div className="flex-1 overflow-hidden">
                      {formData.audioFile ? (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center animate-fadeIn">
                          <i className="fas fa-check-circle text-rose-400 mr-3 shrink-0"></i>
                          <span className="text-sm text-rose-400 font-bold truncate">{formData.audioFile.name}</span>
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, audioFile: null})}
                            className="ml-auto text-rose-400 hover:text-white"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs italic">
                          Record yourself reading the story and upload the MP3/WAV file here. (Recommended for personal touch)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 h-px bg-white/5"></div>
                <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600">OR USE AI</span>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>

              {/* Generate AI Audio */}
              <label className={`flex items-center p-6 bg-slate-950 border rounded-2xl cursor-pointer group transition-all ${formData.audioFile ? 'opacity-40 cursor-not-allowed border-white/5' : 'hover:bg-primary-600/5 border-white/5 hover:border-primary-500/30'}`}>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="generateAudio"
                    disabled={!!formData.audioFile}
                    checked={formData.generateAudio && !formData.audioFile}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 after:peer-checked:bg-white"></div>
                </div>
                <div className="ml-5">
                  <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">Generate Immersive AI Audio</h4>
                  <p className="text-xs text-slate-500 mt-1">Our AI will create a cinematic narration of your story automatically.</p>
                </div>
              </label>
              
              {formData.generateAudio && !formData.audioFile && (
                <div className="animate-fadeIn p-5 bg-primary-600/10 border border-primary-500/20 rounded-2xl flex items-start">
                  <i className="fas fa-info-circle text-primary-400 mt-1 mr-4"></i>
                  <p className="text-sm text-primary-300 leading-relaxed font-medium">
                    AI generation is available since no personal recording was uploaded.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-10">
            <button
              type="button"
              onClick={() => navigate('/author')}
              className="px-8 py-4 bg-slate-900 text-slate-400 font-bold rounded-2xl hover:bg-slate-800 hover:text-white transition-all border border-white/5 active:scale-95"
            >
              <i className="fas fa-times mr-2"></i>Discard
            </button>
            
            <button
              type="button"
              className="px-8 py-4 bg-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 hover:text-white transition-all border border-white/5 active:scale-95"
            >
              <i className="fas fa-save mr-2"></i>Save as Draft
            </button>
            
            <button
              type="submit"
              disabled={loading || audioGenerating}
              className="px-12 py-4 bg-primary-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-xl shadow-primary-600/30 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center min-w-[200px]"
            >
              {loading || audioGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-3"></i>
                  {audioGenerating ? 'Generating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-3"></i>Publish Story
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;
