import React from 'react';
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CodeSnippet from "../../components/CodeSnippet";
import Information from "../../components/Information";
import MoreInformation from "../../components/MoreInformation";
import ScrollProgressBar from "../../components/ScrollProgressBar";

const rainbowCode = `           import tkinter as tk
            from tkinter import ttk
            from PIL import Image, ImageTk
            import tinytuya
            import threading
            import time
            
            class RainbowPastelLightControlApp:
                def __init__(self, root):
                    self.root = root
                    self.root.title("Rainbow and Pastel Light Control")
                    self.root.configure(bg="#F0E6FF")  # Light lavender background
                    self.root.geometry("900x700")  # Increased size to accommodate more buttons
            
                    self.setup_styles()
                    self.setup_lights()
                    self.create_ui()
            
                def setup_styles(self):
                    self.style = ttk.Style(self.root)
                    self.style.theme_use('clam')
                    self.style.configure('TFrame', background='#F0E6FF')
                    self.style.configure('TLabel', background='#F0E6FF', foreground='#5D5D5D', font=('Helvetica', 12))
                    self.style.configure('TScale', background='#F0E6FF', troughcolor='#D4C5F9', sliderrelief='flat')
                    self.style.configure('TButton', background='#B49FDC', foreground='#5D5D5D', font=('Helvetica', 10, 'bold'))
                    self.style.map('TButton', background=[('active', '#A28ACB')])
            
                def setup_lights(self):
                    self.lights = [
                        tinytuya.BulbDevice(
                            dev_id='THEDEVIDYOUGETFROMTINYTUYASCAN',
                            address='192.168.1.3',
                            local_key="YOURLOCALKEY",
                            version=3.3
                        ),
                        tinytuya.BulbDevice(
                            dev_id='THEDEVIDYOUGETFROMTINYTUYASCAN',
                            address='192.168.1.7',
                            local_key="YOURLOCALKEY",
                            version=3.3
                        )
                    ]
                    self.light_states = {'is_on': False}
                    for light in self.lights:
                        light.set_version(3.3)
                        light.set_socketPersistent(True)
            
                def create_ui(self):
                    main_frame = ttk.Frame(self.root, padding=20)
                    main_frame.pack(fill=tk.BOTH, expand=True)
            
                    left_frame = ttk.Frame(main_frame)
                    left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
            
                    right_frame = ttk.Frame(main_frame)
                    right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(10, 0))
            
                    self.create_color_buttons(left_frame)
                    self.create_white_controls(right_frame)
                    self.create_toggle_button(right_frame)
                    self.create_rave_controls(right_frame)
            
                def create_color_buttons(self, parent):
                    rainbow_colors = {
                        "Red": "#FF0000",
                        "Orange": "#FF7F00",
                        "Yellow": "#FFFF00",
                        "Green": "#00FF00",
                        "Blue": "#0000FF",
                        "Indigo": "#4B0082",
                        "Violet": "#8F00FF",
                    }
            
                    pastel_colors = {
                        "Pastel Lavender": "#B49FDC",
                        "Pastel Sky Blue": "#C5EBFE",
                        "Pastel Mint Green": "#A5F8CE",
                        "Pastel Lemon": "#FEFD97",
                        "Pastel Peach": "#FEC9A7",
                        "Pastel Pink": "#F197C0",
                    }
            
                    all_colors = {**rainbow_colors, **pastel_colors, "White": "#FFFFFF"}
            
                    for color_name, hex_color in all_colors.items():
                        button = tk.Button(parent, text=color_name, bg=hex_color, fg=self.get_contrasting_text_color(hex_color),
                                           command=lambda c=self.hex_to_rgb(hex_color): self.set_lights_color(c),
                                           font=('Helvetica', 12, 'bold'), relief=tk.FLAT, padx=10, pady=5,
                                           borderwidth=0, highlightthickness=0)
                        button.pack(fill=tk.X, pady=5, ipady=5)
                        
                        # Bind hover events
                        button.bind("<Enter>", lambda e, b=button: self.on_enter(e, b))
                        button.bind("<Leave>", lambda e, b=button: self.on_leave(e, b))
            
                def create_white_controls(self, parent):
                    ttk.Label(parent, text="White Light Brightness").pack(pady=(0, 5))
                    self.white_brightness_slider = ttk.Scale(parent, from_=0, to=100, orient=tk.HORIZONTAL, command=self.set_white_brightness)
                    self.white_brightness_slider.set(100)
                    self.white_brightness_slider.pack(fill=tk.X, pady=(0, 15))
            
                    ttk.Label(parent, text="White Light Color Temperature").pack(pady=(0, 5))
                    self.color_temp_slider = ttk.Scale(parent, from_=0, to=100, orient=tk.HORIZONTAL, command=self.set_color_temperature)
                    self.color_temp_slider.set(0)
                    self.color_temp_slider.pack(fill=tk.X, pady=(0, 15))
            
                def create_toggle_button(self, parent):
                    bulb_on_img = Image.open("/home/laura/Documents/code/light-bulb-hacking/bulbs/bulb-on.jpg")
                    bulb_off_img = Image.open("/home/laura/Documents/code/light-bulb-hacking/bulbs/bulb-off.jpeg")
            
                    bulb_on_img = bulb_on_img.resize((50, 50), Image.Resampling.LANCZOS)
                    bulb_off_img = bulb_off_img.resize((50, 50), Image.Resampling.LANCZOS)
            
                    self.bulb_on_img = ImageTk.PhotoImage(bulb_on_img)
                    self.bulb_off_img = ImageTk.PhotoImage(bulb_off_img)
            
                    self.toggle_button = ttk.Button(parent, image=self.bulb_off_img, command=self.toggle_lights)
                    self.toggle_button.pack(pady=15)
            
                def create_rave_controls(self, parent):
                    ttk.Label(parent, text="Rave Mode BPM").pack(pady=(0, 5))
                    self.bpm_slider = ttk.Scale(parent, from_=60, to=180, orient=tk.HORIZONTAL)
                    self.bpm_slider.set(120)
                    self.bpm_slider.pack(fill=tk.X, pady=(0, 15))
            
                    bpm_frame = ttk.Frame(parent)
                    bpm_frame.pack(fill=tk.X, pady=(0, 15))
            
                    ttk.Label(bpm_frame, text="BPM:").pack(side=tk.LEFT)
                    self.bpm_entry = ttk.Entry(bpm_frame, width=5, font=('Helvetica', 12))
                    self.bpm_entry.insert(0, "120")
                    self.bpm_entry.pack(side=tk.LEFT, padx=(5, 0))
            
                    self.rave_button = ttk.Button(parent, text="Start Rave Mode", command=self.toggle_rave_mode)
                    self.rave_button.pack(fill=tk.X, pady=(0, 15))
            
                def set_lights_color(self, color, brightness=100, colourtemp=0):
                    if color == (255, 255, 255):
                        for light in self.lights:
                            try:
                                light.set_white_percentage(brightness, colourtemp)
                            except Exception as e:
                                print(f"Error setting white color: {e}")
                    else:
                        r, g, b = color
                        for light in self.lights:
                            try:
                                light.set_colour(r, g, b)
                            except Exception as e:
                                print(f"Error setting color: {e}")
            
                def toggle_lights(self):
                    if self.light_states['is_on']:
                        for light in self.lights:
                            try:
                                light.turn_off()
                            except Exception as e:
                                print(f"Error turning off light: {e}")
                        self.light_states['is_on'] = False
                        self.toggle_button.config(image=self.bulb_off_img)
                    else:
                        for light in self.lights:
                            try:
                                light.turn_on()
                            except Exception as e:
                                print(f"Error turning on light: {e}")
                        self.light_states['is_on'] = True
                        self.toggle_button.config(image=self.bulb_on_img)
            
                def set_white_brightness(self, value):
                    brightness = int(float(value))
                    color_temp = self.color_temp_slider.get()
                    self.set_lights_color((255, 255, 255), brightness, color_temp)
            
                def set_color_temperature(self, value):
                    color_temp = int(float(value))
                    brightness = self.white_brightness_slider.get()
                    self.set_lights_color((255, 255, 255), brightness, color_temp)
            
                def toggle_rave_mode(self):
                    if not hasattr(self, 'rave_mode_active'):
                        self.rave_mode_active = False
            
                    self.rave_mode_active = not self.rave_mode_active
                    if self.rave_mode_active:
                        threading.Thread(target=self.rave_mode).start()
                        self.rave_button.config(text="Stop Rave Mode")
                    else:
                        self.rave_button.config(text="Start Rave Mode")
            
                def rave_mode(self):
                    all_colors = [
                        (255, 0, 0),    # Red
                        (255, 127, 0),  # Orange
                        (255, 255, 0),  # Yellow
                        (0, 255, 0),    # Green
                        (0, 0, 255),    # Blue
                        (75, 0, 130),   # Indigo
                        (143, 0, 255),  # Violet
                        (180, 159, 220),  # Pastel Lavender
                        (197, 235, 254),  # Pastel Sky Blue
                        (165, 248, 206),  # Pastel Mint Green
                        (254, 253, 151),  # Pastel Lemon
                        (254, 201, 167),  # Pastel Peach
                        (241, 151, 192),  # Pastel Pink
                    ]
                    while self.rave_mode_active:
                        for color in all_colors:
                            self.set_lights_color(color)
                            bpm = self.bpm_slider.get()
                            time.sleep(60 / bpm)
            
                @staticmethod
                def hex_to_rgb(hex_color):
                    return tuple(int(hex_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
            
                def on_enter(self, e, button):
                    button['background'] = self.lighten_color(button['background'])
            
                def on_leave(self, e, button):
                    button['background'] = self.darken_color(button['background'])
            
                @staticmethod
                def lighten_color(color):
                    r, g, b = [int(color[i:i+2], 16) for i in (1, 3, 5)]
                    r = min(255, int(r * 1.2))
                    g = min(255, int(g * 1.2))
                    b = min(255, int(b * 1.2))
                    return f'#{r:02x}{g:02x}{b:02x}'
            
                @staticmethod
                def darken_color(color):
                    r, g, b = [int(color[i:i+2], 16) for i in (1, 3, 5)]
                    r = max(0, int(r * 0.8))
                    g = max(0, int(g * 0.8))
                    b = max(0, int(b * 0.8))
                    return f'#{r:02x}{g:02x}{b:02x}'
            
                @staticmethod
                def get_contrasting_text_color(bg_color):
                    r, g, b = [int(bg_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)]
                    luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                    return '#000000' if luminance > 0.5 else '#FFFFFF'
            
            if __name__ == "__main__":
                root = tk.Tk()
                app = RainbowPastelLightControlApp(root)
                root.mainloop()`;

                export default function Blog() {
                  return (
                    <div className="flex flex-col min-h-screen">
                      <Head>
                        <title>Smart Home Lighting Blog</title>
                        <meta
                          name="description"
                          content="A blog post about creating a colorful smart home experience with Python and TinyTuya"
                        />
                      </Head>
                      <ScrollProgressBar />
                      <Header />
                      <main className="flex-grow text-lg container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px] pt-20">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
                          <aside className="lg:col-span-1">
                            <Information />
                          </aside>
                          <div className="lg:col-span-2">
                            <div className="relative p-[4px] rounded-lg bg-gradient-to-r from-cat-frappe-peach to-cat-frappe-yellow">
                              <div className="text-center rounded-lg p-4 lg:p-6 bg-[#ccd0da] dark:bg-cat-frappe-base shadow-lg">
                                <h1 className="text-4xl font-bold mb-6 relative inline-block text-cat-frappe-base dark:text-cat-frappe-yellow after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[4px] after:bg-gradient-to-r after:from-cat-frappe-peach after:to-cat-frappe-yellow after:rounded-[2px]">
                                  💡 Creating a Colorful Smart Home Experience with Python and TinyTuya 🐍🖥️
                                </h1>
                                <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-8 text-xl">
                                  Explore how to control your RGB lights using Python and TinyTuya with a fun GUI!
                                </p>
                                <article className="mt-8 text-left">
                                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                                    As the world of smart home technology expands, so does the excitement of creating personalized automation solutions. Recently, I dove into the TinyTuya library, which allows for seamless control of Tuya-based smart devices using Python. In this post, I'll guide you through setting up TinyTuya and showcase a script I created to control RGB lights using a graphical user interface.
                                  </p>

                                  <div className="text-cat-frappe-base dark:text-cat-frappe-yellow text-3xl font-bold mt-8 mb-4">
                                    Setting Up TinyTuya
                                  </div>

                                  <h3 className="text-2xl font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow mt-6 mb-3">Step 1: Install TinyTuya</h3>
                                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                                    To get started, you need to install TinyTuya. You can easily do this with pip.
                                  </p>
                                  <CodeSnippet
                                    title="Open your terminal and run:"
                                    code="pip install tinytuya"
                                  />

                                  {/* ... Continue with the rest of your content, following this structure ... */}

                                  <div className="text-cat-frappe-base dark:text-cat-frappe-yellow text-3xl font-bold mt-8 mb-4">
                                    My Python Script: Rainbow and Pastel Light Control
                                  </div>
                                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                                    Now that TinyTuya is set up, let's dive into the script I wrote for controlling RGB lights using a friendly GUI. The application lets you set colors, brightness, and even initiate a "rave mode" for a fun lighting experience.
                                  </p>
                                  <CodeSnippet
                                    title="Overview of the Code"
                                    code={rainbowCode}
                                  />

                                  {/* ... Continue with the rest of your content ... */}

                                  <div className="text-cat-frappe-base dark:text-cat-frappe-yellow text-3xl font-bold mt-8 mb-4">
                                    Conclusion
                                  </div>
                                  <p className="text-[#4c4f69] dark:text-cat-frappe-subtext0 mt-2 text-xl">
                                    With TinyTuya and Python, the possibilities for smart home automation are endless. This script serves as a solid foundation for controlling your lights with flair. Feel free to customize the interface, add more features, or integrate additional devices!
                                  </p>
                                </article>
                              </div>
                            </div>
                          </div>
                          <aside className="lg:col-span-1">
                            <MoreInformation />
                          </aside>
                        </div>
                      </main>
                      <Footer />
                    </div>
                  );
                }