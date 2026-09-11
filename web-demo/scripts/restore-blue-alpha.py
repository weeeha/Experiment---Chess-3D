"""Rebuild the original blue export while retaining the source transparency.

The legacy exporter used an opaque connected-component selection mask as the
sprite alpha. That made pixels with source alpha 1/255 as dark as solid ink.
The mask here selects a frame; it never replaces the source alpha channel.
Requires Pillow. Original generated masters are preserved, never overwritten.
"""
from pathlib import Path
import argparse
import hashlib
import json
from PIL import Image


def components(alpha):
    width, height = alpha.size
    pixels = alpha.load()
    seen = bytearray(width * height)
    groups = []
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or pixels[x, y] == 0:
                continue
            points, queue = [], [(x, y)]
            seen[index] = 1
            while queue:
                px, py = queue.pop()
                points.append((px, py))
                for nx, ny in ((px-1, py), (px+1, py), (px, py-1), (px, py+1)):
                    if 0 <= nx < width and 0 <= ny < height:
                        ni = ny * width + nx
                        if not seen[ni] and pixels[nx, ny]:
                            seen[ni] = 1
                            queue.append((nx, ny))
            groups.append(points)
    return groups


def extract_row(row):
    source_alpha = row.getchannel('A')
    found = components(source_alpha)
    mains = sorted(found, key=len, reverse=True)[:4]
    assert len(mains) == 4, 'Expected four poses in each source row'
    mains.sort(key=lambda points: sum(x for x, y in points) / len(points))
    bounds = [(min(x for x, y in p), min(y for x, y in p),
               max(x for x, y in p), max(y for x, y in p)) for p in mains]
    groups = [[] for _ in range(4)]
    for points in found:
        if len(points) < 12:
            continue
        cx = sum(x for x, y in points) / len(points)
        cy = sum(y for x, y in points) / len(points)
        def distance(i):
            left, top, right, bottom = bounds[i]
            return max(left-cx, 0, cx-right)**2 + max(top-cy, 0, cy-bottom)**2
        groups[min(range(4), key=distance)].extend(points)
    frames = []
    for i, points in enumerate(groups):
        alpha = Image.new('L', row.size)
        dest, original = alpha.load(), source_alpha.load()
        for x, y in points:
            dest[x, y] = original[x, y]
        bbox = alpha.getbbox()
        sprite = row.copy()
        sprite.putalpha(alpha)
        sprite = sprite.crop(bbox)
        sprite = sprite.resize((round(sprite.width/2), round(sprite.height/2)), Image.Resampling.NEAREST)
        x = 192 + round((bbox[0] - (i+.5)*row.width/4)/2)
        y = 236 - sprite.height
        frame = Image.new('RGBA', (384, 256))
        frame.alpha_composite(sprite, (x, y))
        frames.append(frame)
    return frames


def rebuild(source, output):
    output.mkdir(parents=True, exist_ok=True)
    report = []
    for name in ('idle',):
        path = source / f'blue-{name}.png'
        master = Image.open(path)
        assert master.mode == 'RGBA', f'{path} must retain its generated alpha'
        split = 520 if name == 'death' else round(master.height/2)
        frames = extract_row(master.crop((0, 0, master.width, split)))
        frames += extract_row(master.crop((0, split, master.width, master.height)))
        first = frames[0].getchannel('A').getbbox()
        factor = 170/(first[3]-first[1])
        (output/name).mkdir(exist_ok=True)
        for i, frame in enumerate(frames):
            bbox = frame.getchannel('A').getbbox()
            sprite = frame.crop(bbox)
            sprite = sprite.resize((round(sprite.width*factor), round(sprite.height*factor)), Image.Resampling.NEAREST)
            x = 192 + round((bbox[0]-192)*factor)
            y = 236 - sprite.height
            assert x >= 8 and y >= 8 and x+sprite.width <= 376
            out = Image.new('RGBA', (384, 256))
            out.alpha_composite(sprite, (x, y))
            target = output/name/f'{name}-{i+1:02d}.png'
            out.save(target)
            report.append({'file': str(target.relative_to(output)),
                           'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                           'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                           'bbox': out.getchannel('A').getbbox()})
    (output/'alpha-restoration.json').write_text(json.dumps(report, indent=2)+'\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path, help='Folder containing original blue-*.png masters')
    parser.add_argument('--output', required=True, type=Path, help='Folder for recovered PNG frames and source hashes')
    args = parser.parse_args()
    rebuild(args.source, args.output)
