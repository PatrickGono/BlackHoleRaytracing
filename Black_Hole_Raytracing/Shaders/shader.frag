#version 330 core
in vec2 textureCoords;

out vec4 fragColor;

uniform sampler2D textureSampler;
uniform float screenWidth;
uniform float screenHeight;
uniform float time;

const float PHI = 1.6180339887498948482;
const float PI = 3.14159265359;
const int NUM_ITERATIONS = 1;
const int NUM_AVERAGE = 1;
const int MAX_STEPS = 1000;
const float MAX_DIST = 100.0f;
const float AMBIENT_FACTOR = 0.5f;
const float SCATTERING_FACTOR = 0.8f;

struct Ray
{
	vec3 origin;
	vec3 direction;
	vec3 color;
	float totalDistance;
	int totalIntersections;
	int totalSteps;
};

struct Intersection
{
	bool isIntersect;
	float dist;
	vec3 intersection;
	vec3 normal;
	vec2 textureCoords;
};

struct Plane
{
	vec3 center;
	vec3 normal;
	vec3 color;
};

struct Disk
{
	vec3 center;
	vec3 normal;
	float radiusOuter;
	float radiusInner;
};

struct Sphere
{
	vec3 center;
	float radius;
	bool isLightSource;
	vec3 color;
};

struct Torus
{
	vec3 center;
	vec3 axis;
	float radiusLarge;
	float radiusSmall;
	bool isLightSource;
	vec3 color;
};

// Random number generator courtesy of Gold Noise �2015 dcerisano@standard3d.com
float randomFloat(vec3 xyz, float seed)
{
	return fract(sin(tan(distance(xyz * PHI, xyz) * seed) * xyz.x));
}

vec3 randomDirectionSphere(vec3 rayDirection, float seed)
{
	float rand1 = randomFloat(rayDirection, seed);
	float rand2 = randomFloat(rayDirection, seed + 0.05);
	float lambda = acos(2 * rand1 - 1.0f) - 0.5f * PI;
	float phi = 2 * PI * rand2;

	float x = cos(lambda) * cos(phi);
	float y = cos(lambda) * sin(phi);
	float z = sin(phi);

	return vec3(x, y, z);
}

Intersection intersectPlane(vec3 rayOrigin, vec3 rayDirection, float maxDist, Plane plane)
{
	Intersection result = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f), vec2(0.0f));

	float denominator = dot(rayDirection, plane.normal);
	if (abs(denominator) < 0.000001f)
	{
		return result;
	}

	vec3 rayOriginToPlaneCenter = plane.center - rayOrigin;
	float dist = dot(rayOriginToPlaneCenter, plane.normal) / denominator;

	if (dist < -0.1f || dist > maxDist)
	{
		return result;
	}

	result.isIntersect = true;
	result.dist = dist;
	result.intersection = rayOrigin + dist * rayDirection;
	result.normal = plane.normal;
	return result;
}

Intersection intersectDisk(vec3 rayOrigin, vec3 rayDirection, float maxDist, Disk disk)
{
	Plane plane;
	plane.center = disk.center;
	plane.normal = disk.normal;

	Intersection result = intersectPlane(rayOrigin, rayDirection, maxDist, plane);

	if (!result.isIntersect)
	{
		return result;
	}
	
	vec3 intersectionToDiskCenter = disk.center - result.intersection;
	float distToCenter = length(intersectionToDiskCenter);
	
	if (distToCenter < disk.radiusInner || distToCenter > disk.radiusOuter)
	{
		return Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f), vec2(0.0f));
	}

	vec3 up = vec3(0.0f, 1.0f, 0.0f);
	vec3 side = normalize(cross(disk.normal, up));
	float radialPos = distToCenter / disk.radiusOuter;

	vec3 intersectionDirection = normalize(intersectionToDiskCenter);
	float det = dot(disk.normal, cross(side, intersectionDirection));
	float dotProduct = dot(side, normalize(intersectionDirection));
	float angularPos = atan(det, dotProduct) + 2.0f * PI * fract(0.05f * time);

	result.textureCoords = vec2(0.5f + 0.5f * radialPos * sin(angularPos), 0.5f + 0.5f * radialPos * cos(angularPos));

	return result;
}

Intersection intersectSphere(vec3 rayOrigin, vec3 rayDirection, float maxDist, Sphere sphere)
{
	Intersection result = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f), vec2(0.0f));

	vec3 sphereCenterToOrigin = rayOrigin - sphere.center;
	float product = dot(rayDirection, sphereCenterToOrigin);
	float discriminant = dot(product, product) - (dot(sphereCenterToOrigin, sphereCenterToOrigin) - sphere.radius * sphere.radius);
	if (discriminant < 0.0f)
	{
		return result;
	}

	float dist = -product - sqrt(discriminant);
	if (dist < -0.1f || dist > maxDist)
	{
		return result;
	}

	result.isIntersect = true;
	result.dist = dist;
	result.intersection = rayOrigin + dist * rayDirection;
	result.normal = normalize(result.intersection - sphere.center);
	return result;
}

vec3 getRayDirection()
{
	float relX = 2.0f * (gl_FragCoord.x / screenWidth - 0.5f);
	float relY = 2.0f * (gl_FragCoord.y / screenWidth - 0.3f);
	float fovFactor = 0.3f;
	return normalize(vec3(fovFactor * relX, fovFactor * relY, 1.0f));
}

void propagateRay(inout Ray ray, float dist)
{
	float effectiveMass = 0.001f;
	vec3 blackHoleCenter = vec3(0.0f, 0.0f, 10.0f);

	vec3 rayOriginToBlackHole = blackHoleCenter - ray.origin;
	float distBH = length(rayOriginToBlackHole);

	vec3 newDirection = ray.direction + effectiveMass / pow(distBH, 4) * rayOriginToBlackHole;
	ray.direction = normalize(newDirection);
	
	ray.totalSteps++;
	ray.origin += dist * ray.direction;
	ray.totalDistance += dist;
	return;
}

float calculateStepLength(Ray ray)
{
	vec3 blackHoleCenter = vec3(0.0f, 0.0f, 10.0f);
	float effectiveMass = 0.1f;
	float coefficient = 0.1f; 

	vec3 rayOriginToBlackHole = blackHoleCenter - ray.origin;
	float distBH = length(rayOriginToBlackHole);
	
	float dist = coefficient * effectiveMass * pow(distBH, 4);
	
	return min(dist, 1.0f);
}

void main()
{
	const int NUM_DISKS = 1;
	Disk disks[NUM_DISKS];
	disks[0] = Disk(vec3(0.0f, 0.0f, 10.0f), normalize(vec3(0.2f, 0.8f, -0.15f)), 2.5f, 0.3f);
	
	vec3 finalColor = vec3(0.0f);

	for (int rayIndex = 0; rayIndex < NUM_AVERAGE; rayIndex++)
	{
		float absorptionFactor = 1.0f;
		Ray ray;
		ray.direction = getRayDirection();
		ray.origin = vec3(0.0f, 0.0f, 0.0f);
		ray.color = vec3(0.0f, 0.0f, 0.0f);
		ray.totalDistance = 0.0f;
		ray.totalSteps = 0;
		ray.totalIntersections = 0;

		while (ray.totalSteps <= MAX_STEPS && ray.totalDistance <= MAX_DIST)
		{
			if (ray.totalIntersections >= NUM_ITERATIONS)
			{
				break;
			}

			Intersection closestIntersection = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f), vec2(0.0f));
			float dist = calculateStepLength(ray);

			Disk closestDisk;
			for (int diskIndex = 0; diskIndex < NUM_DISKS; diskIndex++)
			{
				Intersection intersection = intersectDisk(ray.origin, ray.direction, dist, disks[diskIndex]);
				if (!intersection.isIntersect)
				{
					continue;
				}
	
				if (closestIntersection.dist > intersection.dist)
				{
					closestIntersection = intersection;
					closestDisk = disks[diskIndex];
				}
			}
	
			if (!closestIntersection.isIntersect)
			{	
				propagateRay(ray, dist);
				continue;
			}

		    ray.totalIntersections++;
		    ray.color += texture(textureSampler, closestIntersection.textureCoords).xyz;
		    
		    absorptionFactor *= absorptionFactor;
		    dist = distance(closestIntersection.intersection, ray.origin);
		    propagateRay(ray, dist);

		    ray.direction = normalize((1.0f - SCATTERING_FACTOR) * reflect(ray.direction, -closestIntersection.normal) + SCATTERING_FACTOR * randomDirectionSphere(gl_FragCoord.xyz, fract(time * rayIndex))); 
		}
	
		finalColor += ray.color;
	}

	finalColor = finalColor / NUM_AVERAGE;
	fragColor = vec4(finalColor, 1.0f);
}
