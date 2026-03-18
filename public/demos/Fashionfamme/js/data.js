// data.js


 const products = [
    // ===== DRESSES =====
    {
      id: "dress-1",
      category: "dress",
      name: "Floral Maxi Dress",
      price: 79.99,
      images: [
        "images/dress1.jpg",
        "images/dress1-1.jpg",
        "images/dress1-2.jpg"
      ],
      description:
        "Light blue floral maxi dress || Flattering V-neckline || Flutter sleeves || Flowing silhouette",
      specs:
        "material:chiffon | color:light blue floral | length:maxi | sleeves:short flutter | neckline:v-neck",
      rating: 4.5,
      reviews: 124,
      options: {
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Beige", "Black", "White"]
    }
    },
    {
      id: "dress-2",
      category: "dress",
      name: "Red Bodycon Dress",
      price: 69.99,
      images: [
        "images/dress2.jpg",
        "images/dress2-1.jpg",
        "images/dress2-2.jpg"
      ],
      description:
        "Sleek red bodycon dress || Perfect for evenings || Modern fitted style",
      specs:
        "material:polyester | color:red | length:midi | sleeves:sleeveless | neckline:square",
      rating: 4.7,
      reviews: 98,
      options: {
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Beige", "Black", "White"]
      }
    },
    {
      id: "dress-3",
      category: "dress",
      name: "Yellow Sundress",
      price: 59.99,
      images: [
        "images/dress3.jpg",
        "images/dress3-1.jpg",
        "images/dress3-2.jpg"
      ],
      description:
        "Bright yellow sundress || Lightweight fabric || Perfect for summer days",
      specs:
        "material:cotton | color:yellow | length:above knee | sleeves:strap | neckline:square",
      rating: 4.3,
      reviews: 76,
      
    },
    {
      id: "dress-4",
      category: "dress",
      name: "Black Evening Gown",
      price: 129.99,
      images: [
        "images/dress4.jpg",
        "images/dress4-1.jpg",
        "images/dress4-2.jpg"
      ],
      description:
        "Elegant black evening gown || High slit design || Perfect for formal events",
      specs:
        "material:silk | color:black | length:floor-length | sleeves:off-shoulder | neckline:sweetheart",
      rating: 4.8,
      reviews: 142,
      options: {
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Beige", "Black", "White"]
    }
    },

    // ===== SHOES =====
    {
      id: "shoe-1",
      category: "shoe",
      name: "Strappy Sandals",
      price: 49.0,
      images: [
        "images/shoe1.jpg",
        "images/shoe1-1.jpg",
        "images/shoe1-2.jpg"
      ],
      description:
        "Comfortable strappy sandals || Perfect for summer || Everyday wear",
      specs:
        "material:leather | color:beige | sole:rubber | style:casual",
      rating: 4.5,
      reviews: 124,
      options: {
      sizes: ["36", "37", "38", "39", "40"],
      colors: ["Beige", "Black", "White"]
    }
    },
    {
      id: "shoe-2",
      category: "shoe",
      name: "White Sneakers",
      price: 59.99,
      images: [
        "images/shoe2.jpg",
        "images/shoe2-1.jpg",
        "images/shoe2-2.jpg"
      ],
      description:
        "Classic white sneakers || Cushioned soles || Everyday comfort",
      specs:
        "material:canvas | color:white | sole:rubber | style:casual",
      rating: 4.6,
      reviews: 210
    },
    {
      id: "shoe-3",
      category: "shoe",
      name: "Black Heels",
      price: 79.99,
      images: [
        "images/shoe3.jpg",
        "images/shoe3-1.jpg",
        "images/shoe3-2.jpg"
      ],
      description:
        "Chic black heels || Pointed toe || Perfect for formal occasions",
      specs:
        "material:leather | color:black | sole:synthetic | heel:stiletto",
      rating: 4.7,
      reviews: 88
    },
    {
      id: "shoe-4",
      category: "shoe",
      name: "Brown Loafers",
      price: 69.99,
      images: [
        "images/shoe4.jpg",
        "images/shoe4-1.jpg",
        "images/shoe4-2.jpg"
      ],
      description:
        "Elegant brown loafers || Slip-on design || Everyday formal wear",
      specs:
        "material:leather | color:brown | sole:rubber | style:formal",
      rating: 4.4,
      reviews: 102
    },

    // ===== ACCESSORIES =====
    {
      id: "watch",
      category: "accessories",
      name: "Women's Watch",
      price: 29.99,
      images: [
        "images/watch1.jpg",
        "images/watch1-1.jpg",
        "images/watch1-2.jpg"
      ],
      description:
        "Elegant minimalist watch || Business style || Includes jewelry set",
      specs:
        "material:alloy | color:gold | movement:quartz | style:business",
      rating: 4.4,
      reviews: 102
    },
    {
      id: "bag",
      category: "accessories",
      name: "Tote Bag",
      price: 149.0,
      images: [
        "images/bag1.jpg",
        "images/bag1-1.jpg",
        "images/bag1-2.jpg"
      ],
      description:
        "Luxury tote bag || Vintage design || Shoulder or crossbody wear",
      specs:
        "material:leather | color:white,blue,pink,black | style:luxury",
      rating: 1.5,
      reviews: 14
    },
    {
      id: "jewelry",
      category: "accessories",
      name: "Women's Jewelry Set",
      price: 69.0,
      images: [
        "images/jewelry1.jpg",
        "images/jewelry1-1.jpg",
        "images/jewelry1-2.jpg"
      ],
      description:
        "Elegant jewelry set || Suitable for daily and event wear",
      specs:
        "material:metal | color:silver,copper,gold | style:elegant",
      rating: 2.5,
      reviews: 24
    },
    {
      id: "BagCap",
      category: "accessories",
      name: "Bag & Cap",
      price: 79.0,
      images: [
        "images/Bag&Cap1.jpg",
        "images/Bag&Cap1-1.jpg",
        "images/Bag&Cap1-2.jpg"
      ],
      description:
        "Streetwear bag and cap set || Urban fashion || Daily casual use",
      specs:
        "material:polyester | color:white,red,black | style:streetwear",
      rating: 4.5,
      reviews: 134
    },
    // ===== LIGHTING AND INTERIOR =====
    {
      id: "light-4",
      category: "light",
      name: "Flexible LED Neon Strip Light",
      price: 49.0,
      images: [
        "images/light4.jpg",
        "images/light4-1.jpg",
        "images/light4-2.jpg"
      ],
      description:
        "Flexible LED Neon Strip Light Powered by USB - 196.8 Inches (5 Meters) || Features Touch Control, Can Be Bent And Dimmed | an Energy-Efficient Decoration Suitable for Home, TV Backlighting, Bedrooms, Kitchens, Festivals, Parties ",
      specs:
        "Theme: Space | Control Method: Touch | Holiday Theme: Angels | Style: Art deco | Material: Other material | Power Supply: USB Powered | Battery Properties: Without Battery | Wireless Property: none ",
      rating: 3.0,
      reviews: 390,
      options: {
      colors: ["yellow", "White"]
    }
    },
    {
      id: "light-3",
      category: "light",
      name: "Mini Synthetic Gemstone LED Ceiling Light",
      price: 49.0,
      images: [
        "images/light3.jpg",
        "images/light3-1.jpg",
        "images/light3-2.jpg"
      ],
      description:
        "10cm/3.9inch Mini Synthetic Gemstone LED Ceiling Light, Semi-Flush Mount Hardwired, Suitable for Bedrooms, Living Rooms, Kitchens, and Hallways, Home Decorative Ceiling Light, Bedroom Ceiling Light || Mini Ceiling Light || High-Quality Pendant Light",
      specs:
        "Material: Metal | Control Method: N/A | Embellishment: Other Embellishments | Light Fixture Type: Recessed | Lamp Shade Material: Crystal | Metal Finish Type:  Polished | Mounting Type: Semi flush mount | Accessory: None | Power Supply: Hard-Wired | Acceptable Voltage range: 110 V-240 | Wireless Property: none | Contains Light Source: Yes",
      rating: 3.5,
      reviews: 790,
      options: {
      colors: ["red", "blue", "White", "green"]
    }
    },
    {
      id: "light-1",
      category: "light",
      name: "African Animal Vinyl Wall Clock",
      price: 49.0,
      images: [
        "images/light1.jpg",
        "images/light1-1.jpg",
        "images/light1-2.jpg"
      ],
      description:
        "African Animal Vinyl Wall Clock with LED Lights That Change Colors, Perfect for Home Decor And As Gifts for Birthdays, Christmas, Mother'S Day, Father'S Day, And Store Decoration. Ideal for a Warm Glowing Birthday Celebration",
      specs:
        "Frame Material: Vinyl | Theme: Christmas | Display Type: Digital | Shape: Irregular | Power Supply: Dry Battery Power | Battery Quantity: 1 Piece | Battery Type: AA Battery | Battery Included or Not: No | Brand: inthetime | Do The Accessories Require Batteries?: No | Material: Vinyl | Wireless Property: none ",
      rating: 1.5,
      reviews: 79,
      options: {
      colors: ["red", "blue", "green"]
    }
    },
    {
      id: "light-2",
      category: "light",
      name: "Maple Leaf Branch Light",
      price: 49.0,
      images: [
        "images/light2.jpg",
        "images/light2-1.jpg",
        "images/light2-2.jpg"
      ],
      description:
        "1pc Maple Leaf Branch Light || 96LED LED Light String, Simulated Maple Leaf Vine, USB, 8 Lighting Modes, Suitable for Bedroom, Living Room, Indoor Walls, Home Decoration, Friend Gifts, Ramadan, Valentine'S Day, etc ",
      specs:
        " Material: Plastic | Holidays: Christmas, Halloween, Universal, Ramadan (Eid Al-Fitr), other | Occasion: Wedding, Christmas, Halloween, Prom, Generaling Fit | Lamp Type: Led | Style: Contemporary | Light Source: Led | Control Method: Switch | Theme: Other Topics | Power Supply: USB Powered Without Battery | Mode: Changing | Origin: Guangdong,China ",
      rating: 3.5,
      reviews: 70,
      options: {
      colors: ["yellow", "white"]
    }
    },

    // ===== KITCHEN AND DECO =====

    {
      id: "rag",
      category: "kitchen",
      name: "Multifunctional Kitchen Storage Rack",
      price: 49.0,
      images: [
        "images/rag1.jpg",
        "images/rag1-1.jpg",
        "images/rag1-2.jpg"
      ],
      description:
        "Multifunctional Kitchen Storage Rack with Drain System | Dish and Chopping Board Organizer, Space-Saving Countertop Stand, Utensil and Dish Organizer Rack, Cookware and Plate Organizer | Modern Kitchen Additions, Carbon Steel, Brand XHSGX ",
      specs:
        " Material: Plastic | Holidays: Christmas, Halloween, Universal, Ramadan (Eid Al-Fitr), other | Occasion: Wedding, Christmas, Halloween, Prom, Generaling Fit | Lamp Type: Led | Style: Contemporary | Light Source: Led | Control Method: Switch | Theme: Other Topics | Power Supply: USB Powered Without Battery | Mode: Changing | Origin: Guangdong,China",
      rating: 3.5,
      reviews: 790,
      options: {
      colors: ["red", "blue", "White","green"]
    }
    },

  {
      id: "sink",
      category: "kitchen",
      name: "Multifunctional Kitchen Storage Rack",
      price: 49.0,
      images: [
        "images/sink1.jpg",
        "images/sink1-1.jpg",
        "images/sink1-2.jpg"
      ],
      description:
        "Multifunctional Kitchen Storage Rack with Drain System | Dish and Chopping Board Organizer, Space-Saving Countertop Stand, Utensil and Dish Organizer Rack, Cookware and Plate Organizer | Modern Kitchen Additions, Carbon Steel, Brand XHSGX ",
      specs:
        " Material: Plastic | Holidays: Christmas, Halloween, Universal, Ramadan (Eid Al-Fitr), other | Occasion: Wedding, Christmas, Halloween, Prom, Generaling Fit | Lamp Type: Led | Style: Contemporary | Light Source: Led | Control Method: Switch | Theme: Other Topics | Power Supply: USB Powered Without Battery | Mode: Changing | Origin: Guangdong,China",
      rating: 3.5,
      reviews: 790,
      options: {
      colors: ["red", "blue", "White","green"]
    }
    },

  {
      id: "knife",
      category: "kitchen",
      name: "Multifunctional Kitchen Storage Rack",
      price: 49.0,
      images: [
        "images/knife1.jpg",
        "images/knife1-1.jpg",
        "images/knife1-2.jpg"
      ],
      description:
        "Multifunctional Kitchen Storage Rack with Drain System | Dish and Chopping Board Organizer, Space-Saving Countertop Stand, Utensil and Dish Organizer Rack, Cookware and Plate Organizer | Modern Kitchen Additions, Carbon Steel, Brand XHSGX ",
      specs:
        " Material: Plastic | Holidays: Christmas, Halloween, Universal, Ramadan (Eid Al-Fitr), other | Occasion: Wedding, Christmas, Halloween, Prom, Generaling Fit | Lamp Type: Led | Style: Contemporary | Light Source: Led | Control Method: Switch | Theme: Other Topics | Power Supply: USB Powered Without Battery | Mode: Changing | Origin: Guangdong,China",
      rating: 3.5,
      reviews: 790,
      options: {
      colors: ["red", "blue", "White","green"]
    }
    },

  {
      id: "cook",
      category: "kitchen",
      name: "Multifunctional Kitchen Storage Rack",
      price: 49.0,
      images: [
        "images/cook1.jpg",
        "images/cook1-1.jpg",
        "images/cook1-2.jpg"
      ],
      description:
        "Multifunctional Kitchen Storage Rack with Drain System | Dish and Chopping Board Organizer, Space-Saving Countertop Stand, Utensil and Dish Organizer Rack, Cookware and Plate Organizer | Modern Kitchen Additions, Carbon Steel, Brand XHSGX ",
      specs:
        " Material: Plastic | Holidays: Christmas, Halloween, Universal, Ramadan (Eid Al-Fitr), other | Occasion: Wedding, Christmas, Halloween, Prom, Generaling Fit | Lamp Type: Led | Style: Contemporary | Light Source: Led | Control Method: Switch | Theme: Other Topics | Power Supply: USB Powered Without Battery | Mode: Changing | Origin: Guangdong,China",
      rating: 3.5,
      reviews: 790,
      options: {
      colors: ["red", "blue", "White","green"]
    }
    },
  ];