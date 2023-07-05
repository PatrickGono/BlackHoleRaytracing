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
	vec3 color;
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

// Random number generator courtesy of Gold Noise ©2015 dcerisano@standard3d.com
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

Intersection intersectTorus(vec3 rayOrigin, vec3 rayDirection, Torus torus)
{
	Intersection result = Intersection(false, 0.0f, vec3(0.0f), vec3(0.0f));
	vec3 sphereCenterToOrigin = rayOrigin - torus.center;

	float xi = torus.radiusLarge * torus.radiusLarge - torus.radiusSmall * torus.radiusSmall;
	float phi = torus.radiusLarge * torus.radiusLarge + torus.radiusSmall * torus.radiusSmall;
	float beta = dot(sphereCenterToOrigin, rayOrigin);
	float gamma = dot(rayOrigin, rayOrigin);
	float delta = gamma + xi;
	float sigma = gamma - phi;

	float b = 4.0f * beta;
	float c = 2.0f * delta - 4.0f * torus.radiusLarge * torus.radiusLarge * (rayDirection.x * rayDirection.x + rayDirection.y * rayDirection.y) + 4.0f * beta * beta;
	float d = 8.0f * torus.radiusLarge * torus.radiusLarge * rayDirection.z + 4.0f * beta * sigma;
	float e = 1.0f + xi * xi + 2.0f * (rayDirection.x * rayDirection.x * rayDirection.y * rayDirection.y + rayDirection.z * rayDirection.z * xi + (rayDirection.x * rayDirection.x + rayDirection.y * rayDirection.y) * (rayDirection.z * rayDirection.z - phi));

	float p = 0.375f * b * b + c;
	float q = 0.125f * b * b * b - 0.5f * b * c + d;
	float r = -3.0f / 256.0f * b * b * b * b + 1.0f / 16.0f * b * b * c - 1.0f / 14.0f * b * d + e;

	vec4 intersectionParams = vec4(MAX_DIST);
	if (q >= 0.0)
	{
		float discriminantFirst = 2.0f * xi - p - 4.0f * (xi - sqrt(xi * xi - r));
		if (discriminantFirst >= 0)
		{
			intersectionParams[0] = -0.5f * sqrt(2.0f * xi - p) + 0.5f * sqrt(discriminantFirst) - beta;
			intersectionParams[1] = -0.5f * sqrt(2.0f * xi - p) - 0.5f * sqrt(discriminantFirst) - beta;
		}

		float discriminantSecond = 2.0f * xi - p - 4.0f * (xi + sqrt(xi * xi - r));
		if (discriminantSecond >= 0)
		{
			intersectionParams[2] = 0.5f * sqrt(2.0f * xi - p) + 0.5f * sqrt(discriminantSecond) - beta;
			intersectionParams[3] = 0.5f * sqrt(2.0f * xi - p) - 0.5f * sqrt(discriminantSecond) - beta;
		}
	}
	else
	{
		float discriminantFirst = 2.0f * xi - p - 4.0f * (xi + sqrt(xi * xi - r));
		if (discriminantFirst >= 0)
		{
			intersectionParams[0] = -0.5f * sqrt(2.0f * xi - p) + 0.5f * sqrt(discriminantFirst) - beta;
			intersectionParams[1] = -0.5f * sqrt(2.0f * xi - p) - 0.5f * sqrt(discriminantFirst) - beta;
		}

		float discriminantSecond = 2.0f * xi - p - 4.0f * (xi - sqrt(xi * xi - r));
		if (discriminantSecond >= 0)
		{
			intersectionParams[2] = 0.5f * sqrt(2.0f * xi - p) + 0.5f * sqrt(discriminantSecond) - beta;
			intersectionParams[3] = 0.5f * sqrt(2.0f * xi - p) - 0.5f * sqrt(discriminantSecond) - beta;
		}
	}

	float closestParam = MAX_DIST;
	for (int i = 0; i < 4; i++)
	{
		if (intersectionParams[i] > 0.0f)
		{
			closestParam = min(intersectionParams[i], closestParam);
		}
	}

	if (closestParam < MAX_DIST)
	{
		result.isIntersect = true;
		result.dist = closestParam;
		result.intersection = rayOrigin + closestParam * rayDirection;
		result.normal = rayDirection;
	}

	return result;
}

Intersection intersectPlane(vec3 rayOrigin, vec3 rayDirection, float maxDist, Plane plane)
{
	Intersection result = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f));

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
		return Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f));
	}

	return result;
}

Intersection intersectSphere(vec3 rayOrigin, vec3 rayDirection, float maxDist, Sphere sphere)
{
	Intersection result = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f));

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
	float relY = 2.0f * (gl_FragCoord.y / screenWidth - 0.5f);
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
	float coefficient = 0.1f; // * (1.0f + sin(0.5 * time));

	vec3 rayOriginToBlackHole = blackHoleCenter - ray.origin;
	float distBH = length(rayOriginToBlackHole);
	
	float dist = coefficient * effectiveMass * pow(distBH, 4);
	
	return min(dist, 1.0f);
}

void main()
{
//	const int NUM_SPHERES = 5;
//	Sphere spheres[NUM_SPHERES];
//	spheres[0] = Sphere(vec3(2.0f, -1.0f, 20.0f), 1.5f, false, vec3(1.0f, 0.0f, 0.0f));
//	spheres[1] = Sphere(vec3(-2.0f, -1.5f, 25.0f), 1.0f, false, vec3(0.0f, 1.0f, 0.0f));
//	spheres[2] = Sphere(vec3(0.0f, 0.0f, 10.0f), 0.5f, false, vec3(0.0f, 0.0f, 0.0f));
//	spheres[3] = Sphere(vec3(1.0f, 1.0f, 25.0f), 3.0f, true, vec3(1.0f, 1.0f, 1.0f));
//	spheres[4] = Sphere(vec3(10.0f, -1000.0f, 0.0f), 996.5f, false, vec3(0.4f, 0.45f, 0.7f));
	
	const int NUM_DISKS = 1;
	Disk disks[NUM_DISKS];
	disks[0] = Disk(vec3(0.0f, 0.0f, 10.0f), normalize(vec3(0.0f, sin(0.3f * time), cos(0.3f * time))), 1.5f, 0.5f, vec3(1.0f, 0.7f, 0.0f));



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

			Intersection closestIntersection = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f));
			float dist = calculateStepLength(ray);

			// Sphere closestSphere;
			// for (int sphereIndex = 0; sphereIndex < NUM_SPHERES; sphereIndex++)
			// {
			//	Intersection intersection = intersectSphere(ray.origin, ray.direction, dist, spheres[sphereIndex]);

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
					// closestSphere = spheres[sphereIndex];
					closestDisk = disks[diskIndex];
				}
			}
	
			if (!closestIntersection.isIntersect)
			{	
				propagateRay(ray, dist);
				continue;
			}

		    ray.totalIntersections++;
		    // ray.color += AMBIENT_FACTOR * absorptionFactor * closestSphere.color;
	
		    // if (closestSphere.isLightSource)
		    // {
		    //     ray.color = absorptionFactor * closestSphere.color;
		    //     break;
		    // }

		    ray.color += AMBIENT_FACTOR * absorptionFactor * closestDisk.color;
		    
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
