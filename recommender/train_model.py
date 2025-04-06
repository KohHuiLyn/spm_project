from retrain_model import retrain_user_model

# Your preferences
liked = [
    "Casual",
    "Modern",
    "These comfy shorts are perfect for lounging or running errands. The thick elastic waistband with a drawstring ensures a snug fit, while the functional side pockets give you a place to stash your phone or keys. Relaxed, stylish, and ready for anything! Made of polyester material · Non-lined",
    "A unique piece that is stylish and trendy. Featuring a halter twist neckline, leaving the shoulders and upper back exposed which creates a flattering and chic appearance, The twist in the centre of the neckline adds a touch of sophistication and visual interest to the top, creating a focal point. The top is fitted which helps to emphasise your figure, creating a sleek and stylish look. Made of cotton blend material",
    "These denim jorts are like your favourite pair of jeans, but they're ready to take on the heat kind. With a pleated front for that touch of old-school charm. The side and back pockets hold your essentials, and the belt loops give you room to play with accessories. The raw hemline adds a bit of that \"I'm effortlessly cool\" vibe, perfect for when you want to keep it casual but still make a statement. Made of polyester material · Non-lined",
    "This wide-leg jumpsuit features a modern round neckline and daring side cut-outs with clever armhole coverage panels for a bold yet refined look. The waist darts provide a tailored fit, while functional side pockets add practicality without sacrificing style. A concealed back zipper keeps the silhouette clean and sophisticated. Perfect for making a statement with ease! Made of polyester material",
    "The A-line skirt, crafted from structured cotton twill, features seam detailing around the hips and hemline for a flattering silhouette. Completed with functional patch pockets, this skirt is perfect for both office settings and your errand days. Not lined."
]

# Train the model
retrain_user_model(
    user_id="e932f5dc-949c-4341-9237-27126ef03bbb",
    liked=liked,
    disliked=None,
    saved=None
) 