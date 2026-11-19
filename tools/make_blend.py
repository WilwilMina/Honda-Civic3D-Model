"""Build the Blender copy of the model from the exported .glb.

Imports the glTF, sorts every mesh into one collection per app area (Outside, Under the hood, Inside the
engine, ...), renames objects after their parts, adds a camera, a sun, a world colour and a README text
block, then saves a compressed .blend. The animations exported by the app (Hood_open, Doors_open,
Trunk_open, Front_wheel_off, Engine_running) come along as actions.

Run it through tools/make-blend.mjs, or directly with either of:
    python3 tools/make_blend.py -- input.glb output.blend                      (needs `pip install bpy`)
    blender --background --python tools/make_blend.py -- input.glb output.blend   (Blender 5.3+)
"""
import math
import sys

import bpy

glb, out = sys.argv[sys.argv.index("--") + 1 :][:2]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
scene = bpy.context.scene

# Collection names, in the order the areas appear in the app. Keys are the app's area ids.
LABEL = {
    "car": "1 Outside (body, glass, wheels)",
    "bay": "2 Under the hood",
    "engine": "3 Inside the engine",
    "chassis": "4 Brakes & suspension",
    "trunk": "5 Trunk",
    "cabin": "6 Cabin",
    "lights": "7 Lights & wipers",
    "under": "8 Underneath",
}
cols = {}


def col(area):
    """The collection for an area id, created on first use."""
    name = LABEL.get(area, "Other")
    if name not in cols:
        c = bpy.data.collections.new(name)
        scene.collection.children.link(c)
        cols[name] = c
    return cols[name]


def area_of(o):
    """Area id of an object: from its own or a parent's glTF extras ("area" or "part" = "area:id"),
    falling back to the object-name prefix, then to the exterior."""
    q = o
    while q:
        a = q.get("area") or (q.get("part") or "").split(":")[0]
        if a:
            return a
        prefix = q.name.split("_")[0]
        if prefix in LABEL:
            return prefix
        q = q.parent
    return "car"


# Create the collections in app order (Outliner shows them in creation order), then link each mesh into its
# area collection and give it the part's readable name.
for area_id in LABEL:
    col(area_id)
for o in list(bpy.data.objects):
    if o.type != "MESH":
        continue
    a = area_of(o)
    part_name = o.get("partName")
    if part_name:
        o.name = part_name
    c = col(a)
    if o.name not in c.objects:
        c.objects.link(o)

# Hierarchy objects (empties used as hinge pivots) stay in the scene collection so the animations keep
# working; meshes now live in the area collections only.
for o in list(scene.collection.objects):
    if o.type == "MESH" and any(o.name in c.objects for c in cols.values()):
        scene.collection.objects.unlink(o)

# Camera: front three-quarter view from the driver side (after the glTF import the driver side is -x, front +y).
cam = bpy.data.cameras.new("Camera")
cam.lens = 40
cam_obj = bpy.data.objects.new("Camera", cam)
scene.collection.objects.link(cam_obj)
cam_obj.location = (-5.6, 5.4, 2.3)
aim = bpy.data.objects.new("CameraTarget", None)
aim.location = (0, 0.15, 0.6)
scene.collection.objects.link(aim)
track = cam_obj.constraints.new("TRACK_TO")
track.target = aim
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"
scene.camera = cam_obj
scene.render.resolution_x, scene.render.resolution_y = 1600, 900

# Lighting: one sun plus a light warm-grey world, close to the app's garage look.
sun = bpy.data.lights.new("Sun", "SUN")
sun.energy = 3.0
sun_obj = bpy.data.objects.new("Sun", sun)
sun_obj.rotation_euler = (math.radians(40), math.radians(10), math.radians(30))
scene.collection.objects.link(sun_obj)
world = bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.86, 0.85, 0.82, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.8

# Prefer EEVEE where the build offers it (its identifier differs between Blender versions).
engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
for name in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
    if name in engines:
        scene.render.engine = name
        break

txt = bpy.data.texts.new("README")
txt.write(
    """2013 Honda Civic LX - 3D learning model (Blender copy)

Collections (Outliner, top right): 1 Outside ... 8 Underneath. Click the eye icon to hide/show an area.
Every part is a named object. Select one and open the N panel > Item, or Object Properties > Custom Properties,
to see its part id, name, area and a short summary of what it does.

Animations (Dope Sheet > Action Editor): Hood_open, Doors_open, Trunk_open, Front_wheel_off, Engine_running.
Pick an action for the 'Civic2013LX' rig and press Space to play.

Navigate: middle mouse = orbit, Shift+middle = pan, scroll = zoom, Numpad . = frame selected object.
The interactive version with explanations and the symptom finder is the HTML file.
"""
)

bpy.ops.wm.save_as_mainfile(filepath=out, compress=True)
print("saved", out, len(bpy.data.objects), "objects", list(cols))
